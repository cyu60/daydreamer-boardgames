-- Sessions table: represents a game night session
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(8) UNIQUE NOT NULL,
  name TEXT,
  host_name TEXT NOT NULL,
  status TEXT DEFAULT 'voting' CHECK (status IN ('voting', 'playing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Session games: which games are available in a session
CREATE TABLE session_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, game_id)
);

-- Session votes: votes within a specific session
CREATE TABLE session_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  rank INTEGER, -- 1 = top choice
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, game_id, voter_name)
);

-- Game results: games played during a session
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  is_coop BOOLEAN DEFAULT FALSE,
  coop_won BOOLEAN
);

-- Player results: individual player results for a game
CREATE TABLE player_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_result_id UUID REFERENCES game_results(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  rank INTEGER,
  score INTEGER,
  is_winner BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_sessions_slug ON sessions(slug);
CREATE INDEX idx_session_games_session ON session_games(session_id);
CREATE INDEX idx_session_votes_session ON session_votes(session_id);
CREATE INDEX idx_game_results_session ON game_results(session_id);

-- RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to sessions" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all access to session_games" ON session_games FOR ALL USING (true);
CREATE POLICY "Allow all access to session_votes" ON session_votes FOR ALL USING (true);
CREATE POLICY "Allow all access to game_results" ON game_results FOR ALL USING (true);
CREATE POLICY "Allow all access to player_results" ON player_results FOR ALL USING (true);
