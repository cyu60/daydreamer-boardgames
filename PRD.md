# DayDreamers Board Games - Product Requirements Document

## Overview

A board game night planning and tracking app that helps groups decide what to play, vote on preferences, and log game sessions over time.

---

## User Stories

### As a Host
- I want to create a game session with games from my collection
- I want to generate a shareable link so friends can join and vote
- I want to start the session when everyone is ready
- I want to log game results (who played, who won, scores)

### As a Guest/Friend
- I want to open a shared link and see tonight's game options
- I want to rank games by preference using drag-and-drop
- I want to see what others voted for (transparency)
- I want to view past game history and leaderboards

---

## Feature Requirements

### P0 - Must Have (MVP)

| Feature | Description | Status |
|---------|-------------|--------|
| **Game Collection** | Browse games with search, filtering | Done |
| **Game Details** | View game info, player count, time, YouTube tutorial | Done |
| **Tonight's Picks** | Select games for tonight's session | Done |
| **Simple Voting** | Enter name and vote for preferred games | Done |
| **Supabase Integration** | Persist games, picks, and votes | Done |

### P1 - Should Have (Core Session Flow)

| Feature | Description | Status |
|---------|-------------|--------|
| **Session Creation** | Create a new game session with unique slug/ID | Planned |
| **Shareable Links** | Generate link like `/session/abc123` to share | Planned |
| **Session Landing Page** | Guests see games and can vote without login | Planned |
| **Drag-and-Drop Ranking** | Rank games by preference (not just vote/no-vote) | Planned |
| **Real-time Updates** | See votes update live (Supabase realtime) | Planned |
| **Session State** | Track session status: draft → voting → playing → completed | Planned |
| **Start Session** | Host starts session, finalizes game choices | Planned |

### P2 - Should Have (Game Logging)

| Feature | Description | Status |
|---------|-------------|--------|
| **Log Game Played** | Record which game was played during session | Planned |
| **Record Players** | Add players who participated in each game | Planned |
| **Record Winner** | Log winner(s) or co-op result (win/lose) | Planned |
| **Optional Scores** | Input scores for games with scoring | Planned |
| **Session Summary** | View all games played in a session | Planned |

### P3 - Nice to Have (Analytics & History)

| Feature | Description | Status |
|---------|-------------|--------|
| **Player Leaderboard** | Track wins per player over time | Planned |
| **Game Stats** | Most played games, average session length | Planned |
| **Win/Loss by Player** | Per-game win rates | Planned |
| **History Timeline** | Calendar view of past sessions | Planned |
| **Game Suggestions** | AI-powered game recommendations | Planned |
| **Player Profiles** | Optional accounts to track personal stats | Planned |

### P4 - Future Considerations

| Feature | Description | Status |
|---------|-------------|--------|
| **BoardGameGeek Sync** | Import collection from BGG | Planned |
| **Multiple Collections** | Support multiple game hosts | Planned |
| **Recurring Game Nights** | Schedule weekly sessions | Planned |
| **Notifications** | Reminders for upcoming sessions | Planned |
| **Mobile App** | Native iOS/Android apps | Planned |

---

## Data Model (Updated)

### Sessions Table (New)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(8) UNIQUE NOT NULL, -- Short URL-friendly ID
  name TEXT,                       -- Optional session name
  host_name TEXT NOT NULL,         -- Who created it
  status TEXT DEFAULT 'draft',     -- draft | voting | playing | completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### Session Games Table (New)
```sql
CREATE TABLE session_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, game_id)
);
```

### Votes Table (Updated)
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  rank INTEGER,           -- 1 = first choice, 2 = second, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Game Results Table (New)
```sql
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  is_coop BOOLEAN DEFAULT FALSE,
  coop_result TEXT  -- 'won' | 'lost' for co-op games
);
```

### Player Results Table (New)
```sql
CREATE TABLE player_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_result_id UUID REFERENCES game_results(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  rank INTEGER,           -- 1 = winner, 2 = second place, etc.
  score INTEGER,          -- Optional score
  is_winner BOOLEAN DEFAULT FALSE
);
```

---

## URL Structure

| Route | Description |
|-------|-------------|
| `/` | Main app - collection, tonight's picks |
| `/session/new` | Create new session, select games |
| `/session/[slug]` | Session page (shareable link) |
| `/session/[slug]/vote` | Voting interface for guests |
| `/session/[slug]/play` | In-progress session, log games |
| `/session/[slug]/results` | Completed session summary |
| `/history` | All past sessions |

---

## Technical Approach

1. **Slug Generation**: Use nanoid or similar for short, unique session IDs
2. **Real-time**: Supabase Realtime for live voting updates
3. **Drag-and-Drop**: Use @dnd-kit/core for ranking interface
4. **State Machine**: Session status transitions with validation
5. **Mobile-First**: Current responsive design works well

---

## Success Metrics

- Sessions created per week
- Average votes per session
- Games logged per session
- Return usage (same host creating multiple sessions)
- Session completion rate (draft → completed)
