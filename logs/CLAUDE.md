# Claude Development Log

This file logs all decisions and instructions given during development. Use this to recreate the tutorial for teaching others how to build this project from scratch.

---

## Session 1 - Project Setup

### Project Vision
Building a board game tracking app called "Daydreamer Board Games" for a workshop/tutorial demo.

### Core Problem to Solve
> "Know what games I have and when I last played them."

### MVP Features Defined
1. **Board Game Collection** - View all games with details, track last played
2. **Tonight's Picks** - Pin games you want to play, friends can see
3. **Play Session Logging** - Record who played, scores, history

### Tech Stack Decisions
- **Scraper**: Go (using browser-use pattern for BoardGameGeek)
- **Frontend**: React
- **Backend**: Go API
- **Database**: Supabase (Postgres)

### Data to Scrape from BoardGameGeek
- Name
- Player count (min/max)
- Play time
- Box art image
- Description
- YouTube tutorial link

### Data Models
- `Game` - Board game info (name, players, time, image, description, bgg_id, tutorial_url)
- `PlaySession` - When a game was played
- `Player` - People who play
- `PlayerSession` - Links players to sessions with scores/ranks
- `TonightsPick` - Pinned games for game night

### Development Approach
1. Use Go + browser-use to scrape board game data from BGG
2. Seed Supabase database with scraped data
3. Build Go backend API
4. Build React frontend
5. Deploy

---

## Session 2 - Go Scraper Implementation

### Reference Project
Looked at existing `browser-use-exploration` project at `/Users/china/codeDev/hackathon-projects/browser-use-exploration/` for the browser-use pattern. Found:
- `wingspan-cli/` - Go CLI using Cobra + browser-use API
- `outreach.py` - Python version using `browser_use_sdk`

### Scraper Structure
Created `boardgames-scraper/` folder (renamed from `scraper/` per user request) with:
```
boardgames-scraper/
├── main.go           # Entry point
├── go.mod            # Go module
├── .env.example      # Environment template
├── client/
│   └── browseruse.go # Browser Use API client
├── cmd/
│   ├── root.go       # Cobra root command
│   ├── scrape.go     # Main scrape command
│   ├── list.go       # List games command
│   └── version.go    # Version command
└── data/
    ├── games.go          # Game data types
    └── games_input.json  # Games to scrape
```

### Initial Games List (7 games)
1. Dominion
2. Dominion: Intrigue
3. Bang! The Bullet
4. Catan
5. King of Tokyo
6. Wingspan
7. Ascension Tactics

### Commands Available
- `boardgames-scraper scrape` - Scrape BGG for game data
- `boardgames-scraper list -i data/games_input.json` - List games to scrape
- `boardgames-scraper list -o data/games_output.json` - List scraped games
- `boardgames-scraper version` - Show version

### Environment Variables Required
```
BROWSER_USE_API_KEY=your_api_key
BROWSER_USE_PROFILE_ID=your_profile_id  # optional
```

---

## Session 3 - Frontend UI Layout

### Design System Reference
Used the DayDreamers slide deck template as design reference. Key design tokens:

**Colors:**
- `--ink: #0a0a0f` (dark text/backgrounds)
- `--paper: #f5f2ed` (light backgrounds)
- `--cobalt: #1c3fdc` (primary accent blue)
- `--amber: #d97706` (warning/pinned state)
- `--green: #16a34a` (success)

**Typography:**
- DM Serif Display (headings - with italic accent on one word)
- DM Sans (body text)
- DM Mono (labels, metadata, code)

**UI Patterns:**
- Cards with 1.5px borders and 12px border-radius
- Callout boxes with left border accents
- Hover states with cobalt border + subtle shadow
- Pin buttons with amber highlight when active

### Frontend Structure Created
```
frontend/
├── index.html    # Main layout with all views
└── styles.css    # Complete design system CSS
```

### Layout Components Built
1. **Sidebar Navigation**
   - Brand logo (crescent moon SVG)
   - Nav items: Collection, Tonight's Picks, Play History, Players
   - User card at bottom

2. **Main Content Area**
   - Topbar with search and "Add Game" button
   - Stats row (4 cards: Total Games, Sessions, Players, Most Played)
   - View toggle (grid/list) + filters (category, player count, sort)
   - Game card grid with:
     - Game image with pin button overlay
     - Title, player count, play time
     - Last played date and play count

3. **Tonight's Picks Panel**
   - List of pinned games
   - "Log Play Session" and "Share Link" actions
   - Info callout about friend visibility

4. **Log Play Modal**
   - Game selector
   - Date picker
   - Player chips (add/remove)
   - Winner selector
   - Notes textarea

### Responsive Breakpoints
- `>1200px`: Full 3-column layout (sidebar + main + picks panel)
- `768-1200px`: 2-column (sidebar + main, picks hidden)
- `<768px`: Single column (mobile, sidebar hidden)

### Files Added to .gitignore
- `daydreamers-slides*.html` - Reference slides not part of codebase

---

## How to Use This Log
Every conversation with Claude about this project should be logged here. When giving instructions, tell Claude to update this file with:
- Decisions made
- Features added
- Problems encountered and solutions
- Any context needed to recreate the tutorial
