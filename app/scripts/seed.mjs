// Seed script - run with: node scripts/seed.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://zqbpgckvkocqzlmkjymy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYnBnY2t2a29jcXpsbWtqeW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTUxMTMsImV4cCI6MjA4ODMzMTExM30.wCdbMGD99WYFT7IsnEvVZ58-zaCO18bBTJrc555PkMc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read games data
const gamesPath = join(__dirname, '../../boardgames-scraper/data/games_output.json');
const games = JSON.parse(readFileSync(gamesPath, 'utf-8'));

async function seed() {
  console.log(`Seeding ${games.length} games...`);

  // First, clear existing games
  const { error: deleteError } = await supabase.from('games').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Error deleting existing games:', deleteError);
  } else {
    console.log('Cleared existing games');
  }

  // Prepare games data (remove empty id field from scraped data)
  const gamesData = games.map(game => ({
    name: game.name,
    bgg_id: game.bgg_id,
    min_players: game.min_players,
    max_players: game.max_players,
    play_time_minutes: game.play_time_minutes,
    image_url: game.image_url,
    description: game.description,
    tutorial_url: game.tutorial_url,
    year_published: game.year_published,
    rating: game.rating
  }));

  // Insert all games
  const { data, error } = await supabase.from('games').insert(gamesData).select();

  if (error) {
    console.error('Error inserting games:', error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} games:`);
  data.forEach(game => console.log(`  - ${game.name} (${game.bgg_id})`));
}

seed().catch(console.error);
