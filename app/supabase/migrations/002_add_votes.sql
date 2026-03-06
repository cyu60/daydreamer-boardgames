-- Add votes table for game night voting
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for counting votes per game
CREATE INDEX idx_votes_game_id ON votes(game_id);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow all access for now
CREATE POLICY "Allow all access to votes" ON votes FOR ALL USING (true);
