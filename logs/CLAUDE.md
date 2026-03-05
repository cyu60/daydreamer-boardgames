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

## How to Use This Log
Every conversation with Claude about this project should be logged here. When giving instructions, tell Claude to update this file with:
- Decisions made
- Features added
- Problems encountered and solutions
- Any context needed to recreate the tutorial
