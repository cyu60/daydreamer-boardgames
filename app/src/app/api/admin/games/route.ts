import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../auth/route';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

// GET - List all games
export async function GET(request: Request) {
  const token = getToken(request);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ games: games || [] });

  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

// DELETE - Delete a game
export async function DELETE(request: Request) {
  const token = getToken(request);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
    }

    // Delete related data first
    await supabase.from('session_games').delete().eq('game_id', gameId);
    await supabase.from('session_votes').delete().eq('game_id', gameId);
    await supabase.from('game_results').delete().eq('game_id', gameId);
    await supabase.from('game_tasks').delete().eq('game_id', gameId);

    // Delete the game
    const { error } = await supabase.from('games').delete().eq('id', gameId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Game deleted' });

  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
