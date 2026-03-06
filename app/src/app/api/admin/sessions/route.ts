import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '../auth/route';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware to verify admin token
function getToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  return authHeader?.replace('Bearer ', '') || null;
}

// GET - List all sessions with stats
export async function GET(request: Request) {
  const token = getToken(request);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Get vote counts per session
    const { data: voteCounts } = await supabase
      .from('session_votes')
      .select('session_id');

    const votesBySession = (voteCounts || []).reduce((acc, vote) => {
      acc[vote.session_id] = (acc[vote.session_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get game result counts per session
    const { data: resultCounts } = await supabase
      .from('game_results')
      .select('session_id');

    const resultsBySession = (resultCounts || []).reduce((acc, result) => {
      acc[result.session_id] = (acc[result.session_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Combine data
    const sessionsWithStats = (sessions || []).map(session => ({
      ...session,
      vote_count: votesBySession[session.id] || 0,
      games_played: resultsBySession[session.id] || 0
    }));

    return NextResponse.json({ sessions: sessionsWithStats });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// DELETE - Delete a session and all related data
export async function DELETE(request: Request) {
  const token = getToken(request);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    if (deleteAll) {
      // Delete all sessions and related data
      // Order matters due to foreign keys
      await supabase.from('player_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('game_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('session_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('session_games').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({ success: true, message: 'All sessions deleted' });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Delete related data first (foreign key constraints)
    // Get game_results for this session to delete player_results
    const { data: gameResults } = await supabase
      .from('game_results')
      .select('id')
      .eq('session_id', sessionId);

    if (gameResults && gameResults.length > 0) {
      const resultIds = gameResults.map(r => r.id);
      await supabase.from('player_results').delete().in('game_result_id', resultIds);
    }

    // Delete in order
    await supabase.from('game_results').delete().eq('session_id', sessionId);
    await supabase.from('session_votes').delete().eq('session_id', sessionId);
    await supabase.from('session_games').delete().eq('session_id', sessionId);

    // Finally delete the session
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Session deleted' });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
