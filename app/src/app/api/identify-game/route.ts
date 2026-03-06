import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BROWSER_USE_API_KEY = process.env.BROWSER_USE_API_KEY;
const BROWSER_USE_PROFILE_ID = process.env.BROWSER_USE_PROFILE_ID;

interface BrowserUseTask {
  id: string;
  status: string;
  output?: string | null;  // v2 API returns output directly as string
}

// Helper to update task status
async function updateTask(taskId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('game_tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    console.error('Failed to update task:', error);
  }
}

// Step 1: Identify game from image using OpenAI Vision
async function identifyGame(imageUrl: string): Promise<{ name: string; confidence: number }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Using gpt-4o as it's the most capable vision model available
    messages: [
      {
        role: 'system',
        content: 'You are a board game expert. When shown an image of a board game box, identify the game name. Respond with ONLY a JSON object in this exact format: {"name": "Game Name", "confidence": 0.95}. The confidence should be between 0 and 1. If you cannot identify the game, use {"name": "Unknown", "confidence": 0}.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          },
          {
            type: 'text',
            text: 'What board game is shown in this image? Identify the game name.'
          }
        ]
      }
    ],
    max_tokens: 150,
    temperature: 0.1
  });

  const content = response.choices[0]?.message?.content || '';

  try {
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || 'Unknown',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
      };
    }
  } catch {
    // If JSON parsing fails, try to extract game name from text
    console.error('Failed to parse OpenAI response:', content);
  }

  return { name: 'Unknown', confidence: 0 };
}

// Step 2: Scrape BGG using browser-use API
async function scrapeBGG(gameName: string): Promise<{
  bgg_url: string;
  min_players: number;
  max_players: number;
  play_time_minutes: number;
  image_url: string | null;
  description: string | null;
  year_published: number | null;
  rating: number | null;
}> {
  if (!BROWSER_USE_API_KEY) {
    throw new Error('BROWSER_USE_API_KEY not configured');
  }

  // Create browser-use task (v2 API)
  const createResponse = await fetch('https://api.browser-use.com/api/v2/tasks', {
    method: 'POST',
    headers: {
      'X-Browser-Use-API-Key': BROWSER_USE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      task: `Go to boardgamegeek.com and search for the board game "${gameName}". Click on the first search result. Extract the following information from the game page and return it as JSON:
- bgg_url: the full URL of the game page
- min_players: minimum number of players (number)
- max_players: maximum number of players (number)
- play_time_minutes: playing time in minutes (number, use the average if a range is given)
- image_url: the main game box image URL
- description: a brief description of the game (first 500 characters)
- year_published: the year the game was published (number)
- rating: the BGG rating (number with one decimal)

Return ONLY the JSON object, no other text.`,
      ...(BROWSER_USE_PROFILE_ID && { save_browser_data_profile_id: BROWSER_USE_PROFILE_ID })
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create browser-use task: ${errorText}`);
  }

  const taskData = await createResponse.json() as { id: string };
  const taskId = taskData.id;

  // Poll for task completion (max 2 minutes)
  const maxAttempts = 24;
  const pollInterval = 5000; // 5 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const statusResponse = await fetch(`https://api.browser-use.com/api/v2/tasks/${taskId}`, {
      headers: {
        'X-Browser-Use-API-Key': BROWSER_USE_API_KEY
      }
    });

    if (!statusResponse.ok) {
      continue;
    }

    const status = await statusResponse.json() as BrowserUseTask;

    if (status.status === 'finished' && status.output) {
      try {
        // Parse the result - it should be JSON (v2 API returns output directly)
        // Handle escaped JSON strings (e.g., {\"key\": \"value\"})
        let result = status.output;
        if (result.includes('\\"')) {
          result = result.replace(/\\"/g, '"');
        }
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            bgg_url: parsed.bgg_url || `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(gameName)}`,
            min_players: parseInt(parsed.min_players) || 2,
            max_players: parseInt(parsed.max_players) || 4,
            play_time_minutes: parseInt(parsed.play_time_minutes) || 60,
            image_url: parsed.image_url || null,
            description: parsed.description || null,
            year_published: parsed.year_published ? parseInt(parsed.year_published) : null,
            rating: parsed.rating ? parseFloat(parsed.rating) : null
          };
        }
      } catch (e) {
        console.error('Failed to parse browser-use result:', e);
      }
    }

    if (status.status === 'failed') {
      throw new Error('Browser-use task failed');
    }
  }

  throw new Error('Browser-use task timed out');
}

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // Get task from database
    const { data: task, error: taskError } = await supabase
      .from('game_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update status to identifying
    await updateTask(taskId, { status: 'identifying' });

    // Step 1: Identify game from image
    let identification;
    try {
      identification = await identifyGame(task.image_url);
    } catch (error) {
      console.error('Vision API error:', error);
      await updateTask(taskId, {
        status: 'error',
        error_message: 'Failed to identify game from image',
        completed_at: new Date().toISOString()
      });
      return NextResponse.json({ error: 'Vision API failed' }, { status: 500 });
    }

    if (identification.name === 'Unknown' || identification.confidence < 0.3) {
      await updateTask(taskId, {
        status: 'error',
        identified_name: identification.name,
        confidence: identification.confidence,
        error_message: 'Could not confidently identify the game. Please try with a clearer image.',
        completed_at: new Date().toISOString()
      });
      return NextResponse.json({ error: 'Could not identify game' }, { status: 400 });
    }

    // Update with identified name
    await updateTask(taskId, {
      identified_name: identification.name,
      confidence: identification.confidence,
      status: 'scraping'
    });

    // Step 2: Scrape BGG for game details
    let gameDetails;
    try {
      gameDetails = await scrapeBGG(identification.name);
    } catch (error) {
      console.error('BGG scraping error:', error);
      await updateTask(taskId, {
        status: 'error',
        error_message: 'Failed to fetch game details from BoardGameGeek',
        completed_at: new Date().toISOString()
      });
      return NextResponse.json({ error: 'BGG scraping failed' }, { status: 500 });
    }

    // Step 3: Check if game already exists
    const { data: existingGame } = await supabase
      .from('games')
      .select('id')
      .ilike('name', identification.name)
      .single();

    let gameId: string;

    if (existingGame) {
      // Game already exists
      gameId = existingGame.id;
    } else {
      // Create new game
      const { data: newGame, error: createError } = await supabase
        .from('games')
        .insert({
          name: identification.name,
          min_players: gameDetails.min_players,
          max_players: gameDetails.max_players,
          play_time_minutes: gameDetails.play_time_minutes,
          image_url: gameDetails.image_url,
          description: gameDetails.description,
          year_published: gameDetails.year_published,
          rating: gameDetails.rating
        } as any)
        .select()
        .single();

      if (createError || !newGame) {
        console.error('Failed to create game:', createError);
        await updateTask(taskId, {
          status: 'error',
          error_message: 'Failed to save game to database',
          completed_at: new Date().toISOString()
        });
        return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
      }

      gameId = (newGame as { id: string }).id;
    }

    // Update task as complete
    await updateTask(taskId, {
      status: 'complete',
      bgg_url: gameDetails.bgg_url,
      game_id: gameId,
      completed_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      gameId,
      gameName: identification.name,
      confidence: identification.confidence
    });

  } catch (error) {
    console.error('Identify game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
