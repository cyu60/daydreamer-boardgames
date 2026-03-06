// Cleanup duplicate games
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://zqbpgckvkocqzlmkjymy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYnBnY2t2a29jcXpsbWtqeW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTUxMTMsImV4cCI6MjA4ODMzMTExM30.wCdbMGD99WYFT7IsnEvVZ58-zaCO18bBTJrc555PkMc'
);

async function cleanup() {
  // Get all games
  const { data: allGames, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
    return;
  }

  console.log(`Found ${allGames.length} total games`);

  // Group by bgg_id to find duplicates
  const byBggId = {};
  for (const game of allGames) {
    const key = game.bgg_id || game.name; // Use name if no bgg_id
    if (!byBggId[key]) {
      byBggId[key] = [];
    }
    byBggId[key].push(game);
  }

  // Find IDs to delete (keep the first one, delete the rest)
  const idsToDelete = [];
  for (const [key, games] of Object.entries(byBggId)) {
    if (games.length > 1) {
      console.log(`Duplicate: ${games[0].name} (${games.length} copies)`);
      // Keep the first one with most data, delete others
      const sorted = games.sort((a, b) => {
        // Prefer ones with bgg_id
        if (a.bgg_id && !b.bgg_id) return -1;
        if (!a.bgg_id && b.bgg_id) return 1;
        return 0;
      });
      idsToDelete.push(...sorted.slice(1).map(g => g.id));
    }
  }

  // Also remove games without bgg_id (like "Pandemic")
  const gamesWithoutBggId = allGames.filter(g => !g.bgg_id);
  for (const game of gamesWithoutBggId) {
    if (!idsToDelete.includes(game.id)) {
      console.log(`No BGG ID: ${game.name}`);
      idsToDelete.push(game.id);
    }
  }

  if (idsToDelete.length === 0) {
    console.log('No duplicates to remove');
    return;
  }

  console.log(`\nDeleting ${idsToDelete.length} duplicate/invalid entries...`);

  // Delete related records first (tonights_picks, votes, game_tasks, etc.)
  for (const id of idsToDelete) {
    await supabase.from('game_tasks').delete().eq('game_id', id);
    await supabase.from('tonights_picks').delete().eq('game_id', id);
    await supabase.from('votes').delete().eq('game_id', id);
    await supabase.from('play_sessions').delete().eq('game_id', id);
  }

  // Delete duplicates
  const { error: deleteError } = await supabase
    .from('games')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('Error deleting:', deleteError);
  } else {
    console.log('Cleanup complete!');
  }

  // Verify
  const { data: remaining } = await supabase
    .from('games')
    .select('name, bgg_id')
    .order('name');

  console.log(`\n${remaining.length} games remaining:`);
  remaining.forEach(g => console.log(`  - ${g.name} (BGG: ${g.bgg_id})`));
}

cleanup().catch(console.error);
