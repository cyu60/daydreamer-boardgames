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

// GET - Dashboard stats
export async function GET(request: Request) {
  const token = getToken(request);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Count games
    const { count: gamesCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });

    // Count sessions by status
    const { data: sessions } = await supabase
      .from('sessions')
      .select('status');

    const sessionStats = {
      total: sessions?.length || 0,
      voting: sessions?.filter(s => s.status === 'voting').length || 0,
      playing: sessions?.filter(s => s.status === 'playing').length || 0,
      completed: sessions?.filter(s => s.status === 'completed').length || 0
    };

    // Count total votes
    const { count: votesCount } = await supabase
      .from('session_votes')
      .select('*', { count: 'exact', head: true });

    // Count game results
    const { count: resultsCount } = await supabase
      .from('game_results')
      .select('*', { count: 'exact', head: true });

    // Count game tasks
    const { data: tasks } = await supabase
      .from('game_tasks')
      .select('status');

    const taskStats = {
      total: tasks?.length || 0,
      pending: tasks?.filter(t => t.status === 'pending').length || 0,
      complete: tasks?.filter(t => t.status === 'complete').length || 0,
      error: tasks?.filter(t => t.status === 'error').length || 0
    };

    return NextResponse.json({
      games: gamesCount || 0,
      sessions: sessionStats,
      votes: votesCount || 0,
      gamesPlayed: resultsCount || 0,
      gameTasks: taskStats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
