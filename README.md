# Daydreamer Board Games

A web app to track your board game collection, log play sessions, and coordinate game nights with friends.

## Tech Stack

- **Scraper**: Go (browser-use for BoardGameGeek)
- **Backend**: Go API
- **Frontend**: React
- **Database**: Supabase (Postgres)

## Product Requirements Document (PRD)

### Problem Statement

Board game enthusiasts struggle to:
- Remember which games they own and when they last played them
- Decide what to play on game night
- Coordinate game nights with friends
- Track who played what and how well they did

### Core Features (MVP)

#### 1. Board Game Collection
- View all board games in your collection
- See game details (name, player count, play time, complexity)
- Track when each game was last played

#### 2. "Tonight's Picks" Pinboard
- Pin games you want to play tonight
- Friends can see what's on the table
- Easy way to vote or express interest

#### 3. Play Session Logging
- Log when you play a game
- Record who played and scores/rankings
- Build a history of plays over time

### Nice-to-Have Features (Post-MVP)

- Calendar view of upcoming game nights
- Friend sharing via link (no auth required to view)
- Player statistics and leaderboards
- Game recommendations based on play history

### Technical Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│   Go API    │────▶│  Supabase   │
│  Frontend   │     │   Backend   │     │  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
        ▲
        │
┌───────┴───────┐
│  Go Scraper   │──── BoardGameGeek
│ (browser-use) │
└───────────────┘
```

### Data Models

**Game**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Game title |
| min_players | Int | Minimum players |
| max_players | Int | Maximum players |
| play_time_minutes | Int | Average play time |
| image_url | String | Box art image |
| description | Text | Game description |
| tutorial_url | String | YouTube tutorial link |
| bgg_id | String | BoardGameGeek ID |

**PlaySession**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Foreign key to Game |
| played_at | DateTime | When the game was played |
| notes | String | Optional session notes |

**Player**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Player name |
| email | String | Email (optional, for auth) |

**PlayerSession**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to PlaySession |
| player_id | UUID | Foreign key to Player |
| score | Int | Final score (optional) |
| rank | Int | Final ranking (1st, 2nd, etc.) |

**TonightsPick**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Foreign key to Game |
| pinned_by | UUID | Foreign key to Player |
| pinned_at | DateTime | When it was pinned |

### Development Phases

**Phase 1: Data Scraping**
- [ ] Build Go scraper for BoardGameGeek
- [ ] Scrape: name, player count, play time, image, description, tutorial
- [ ] Export to JSON for seeding

**Phase 2: Database Setup**
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Seed with scraped data

**Phase 3: Backend API**
- [ ] Go API with CRUD for games
- [ ] Play session endpoints
- [ ] Tonight's picks endpoints

**Phase 4: Frontend**
- [ ] React app setup
- [ ] Game collection view (list/grid)
- [ ] Game detail page
- [ ] Play logging UI
- [ ] Tonight's picks UI

**Phase 5: Deploy**
- [ ] Deploy frontend (Vercel?)
- [ ] Connect to Supabase production

### MVP Scope Reminder

> "What is the 1 thing that you want to solve?"

**Answer**: Know what games I have and when I last played them.

Everything else is feature creep until this works perfectly.

---

## Project Structure

```
daydreamer-boardgames/
├── boardgames-scraper/   # Go scraper for BGG (browser-use)
├── backend/              # Go API (coming soon)
├── frontend/             # React app (coming soon)
├── logs/                 # Development logs
│   └── CLAUDE.md         # AI conversation log for tutorial
└── README.md
```

## Scraper Usage

```bash
cd boardgames-scraper

# Copy env and add your Browser Use credentials
cp .env.example .env

# Build
go build -o boardgames-scraper .

# List games to scrape
./boardgames-scraper list -i data/games_input.json

# Run the scraper (requires BROWSER_USE_API_KEY)
./boardgames-scraper scrape

# View scraped results
./boardgames-scraper list -o data/games_output.json
```

## Development Log

See [logs/CLAUDE.md](logs/CLAUDE.md) for a detailed log of all development decisions. This is used to recreate the tutorial for teaching others.

## Getting Started

*TODO: Add setup instructions as we build*

## License

MIT
