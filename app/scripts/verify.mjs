// Verify games in database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zqbpgckvkocqzlmkjymy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYnBnY2t2a29jcXpsbWtqeW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTUxMTMsImV4cCI6MjA4ODMzMTExM30.wCdbMGD99WYFT7IsnEvVZ58-zaCO18bBTJrc555PkMc'
);

const { data, error } = await supabase.from('games').select('name, bgg_id').order('name');
if (error) {
  console.error('Error:', error);
} else {
  console.log(`\n${data.length} games in database:\n`);
  data.forEach(g => console.log(`  - ${g.name} (BGG: ${g.bgg_id})`));
}
