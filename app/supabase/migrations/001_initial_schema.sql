-- DayDreamers Board Games - Initial Schema
-- Run this in Supabase SQL Editor

-- Games table (populated from scraper)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bgg_id TEXT,
  min_players INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL DEFAULT 4,
  play_time_minutes INTEGER NOT NULL DEFAULT 30,
  image_url TEXT,
  description TEXT,
  tutorial_url TEXT,
  year_published INTEGER,
  rating DECIMAL(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Play sessions (when a game was played)
CREATE TABLE play_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player sessions (links players to sessions with scores)
CREATE TABLE player_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES play_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER,
  rank INTEGER
);

-- Tonight's picks (pinned games)
CREATE TABLE tonights_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  pinned_by UUID REFERENCES players(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_play_sessions_game_id ON play_sessions(game_id);
CREATE INDEX idx_play_sessions_played_at ON play_sessions(played_at DESC);
CREATE INDEX idx_player_sessions_session_id ON player_sessions(session_id);
CREATE INDEX idx_player_sessions_player_id ON player_sessions(player_id);
CREATE INDEX idx_tonights_picks_game_id ON tonights_picks(game_id);

-- Enable Row Level Security (public access for now)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tonights_picks ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - can be restricted later)
CREATE POLICY "Allow all access to games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all access to players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all access to play_sessions" ON play_sessions FOR ALL USING (true);
CREATE POLICY "Allow all access to player_sessions" ON player_sessions FOR ALL USING (true);
CREATE POLICY "Allow all access to tonights_picks" ON tonights_picks FOR ALL USING (true);
