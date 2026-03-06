-- Game tasks table: tracks photo-to-game identification tasks
CREATE TABLE game_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'identifying', 'scraping', 'complete', 'error')),
  image_url TEXT NOT NULL,
  identified_name TEXT,
  confidence REAL,
  bgg_url TEXT,
  game_id UUID REFERENCES games(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_game_tasks_status ON game_tasks(status);
CREATE INDEX idx_game_tasks_created ON game_tasks(created_at DESC);

-- RLS policies
ALTER TABLE game_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to game_tasks" ON game_tasks FOR ALL USING (true);

-- Storage bucket for game photos (run this in Supabase dashboard SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-photos', 'game-photos', true);
