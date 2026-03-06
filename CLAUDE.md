# DayDreamers Board Games - Development Log

## Project Overview

A board game collection management app built for the DayDreamers workshop/tutorial. Features include:
- Game collection browsing with search
- Tonight's picks with voting system
- Play session history tracking
- Embedded YouTube tutorials

**Tech Stack:**
- Next.js 14+ (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- Vercel (deployment)
- Go scraper with browser-use for BoardGameGeek data

**Live URL:** https://daydreamer-boardgames.vercel.app

---

## Session 7 - March 2026

### UI Fixes
- Fixed header layout issues (logo being cut off)
- Rewrote CSS to match reference design with proper header glow effect
- Implemented `.app-container`, `.app-header`, `.app-tabs`, `.app-content` class structure
- Added ambient glow using `::before` pseudo-element with radial gradients
- Desktop breakpoint at 640px with rounded card layout

### New Features
- **Game Details Modal**: Click on any game to see details (description, player count, year, rating)
- **Embedded YouTube Tutorials**: YouTube tutorial videos embedded in game details modal
- **Voting System**: Users enter their name and vote for games they want to play tonight
- **Persistence**: Votes and Tonight's Picks now persist to Supabase database

### Database Changes
- Created `votes` table migration (`002_add_votes.sql`)
  - `id`, `game_id`, `voter_name`, `created_at`
  - RLS policy for public access
  - Index on `game_id` for performance

### Files Modified
- `app/src/app/globals.css` - Complete CSS rewrite for proper styling
- `app/src/app/page.tsx` - Added GameDetailsModal, voting UI, Supabase persistence
- `app/src/types/database.ts` - Added Vote type definition
- `app/supabase/migrations/002_add_votes.sql` - New migration for votes table

---

## Session 9 - March 2026

### New Features

**Drag-and-Drop Ranking:**
- Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Users enter name then drag games to reorder by preference
- Rank badges (#1, #2, etc.) show position
- "Save My Ranking" persists to `session_votes.rank` column
- Supports touch, mouse, and keyboard interactions

**Host Controls:**
- Host token stored in localStorage on session creation
- Session page checks if current user is host
- "Start Game Night" button: voting → playing
- "End Session" button: playing → completed
- Controls only visible to host

**Game Results Logging:**
- Host sees "Log a Game" form during playing status
- Select game from dropdown
- Toggle co-op mode with "Team Won"/"Team Lost" buttons
- For competitive: add players with winner checkboxes
- Saves to `game_results` and `player_results` tables
- Logged games appear in list above form

### Files Modified
- `app/package.json` - Added @dnd-kit dependencies
- `app/src/app/page.tsx` - Store host token in localStorage on session creation
- `app/src/app/session/[slug]/page.tsx` - Complete rewrite with all three features
- `app/src/app/globals.css` - Styles for drag handles, host controls, result form

### CSS Classes Added
- `.drag-handle`, `.rank-badge`, `.game-item.sortable`, `.dragging`
- `.host-controls`, `.btn-primary`, `.btn-secondary`
- `.game-result-form`, `.toggle`, `.coop-result`, `.players-list`, `.player-row`

---

## Session 8 - March 2026

### BoardGameGeek Scraping - Full Collection

Scraped all remaining games from the collection to populate the database.

**Batch 1 (5 games):**
- Dominion: Intrigue (BGG ID: 40834)
- BANG! The Bullet! (BGG ID: 30933)
- King of Tokyo (BGG ID: 70323)
- Ascension Tactics (BGG ID: 304531)
- Sushi Go Party! (BGG ID: 192291)

**Batch 2 (5 games):**
- SCOUT (BGG ID: 291453)
- Startups (BGG ID: 223770)
- ito (BGG ID: 327778)
- For Sale (BGG ID: 172)
- Salt and Pepper (BGG ID: 244798)

**Total Collection:** 13 games now in `games_output.json`
- Catan, Dominion, Wingspan (previously scraped)
- 10 new games from batch scraping

**Data Fields Scraped:**
- name, bgg_id, min_players, max_players
- play_time_minutes, image_url, description
- tutorial_url (YouTube), year_published, rating

**Files Created/Modified:**
- `boardgames-scraper/data/batch1_input.json` - Input for batch 1
- `boardgames-scraper/data/batch1_output.json` - Output from batch 1
- `boardgames-scraper/data/batch2_input.json` - Input for batch 2
- `boardgames-scraper/data/batch2_output.json` - Output from batch 2
- `boardgames-scraper/data/games_output.json` - Merged final output (13 games)

**Notes:**
- Batch 2 had JSON parsing error in scraper; manually extracted data
- Used browser-use API with `--live` flag for monitoring
- Each batch took ~10-12 minutes to complete

---

## Previous Sessions (Summary)

### Sessions 1-6
- Initial project setup with Next.js and Supabase
- Go scraper development using browser-use for BoardGameGeek
- Scraped initial games (Catan, Dominion, Wingspan)
- Basic UI implementation
- Vercel deployment setup
- Database schema design (games, play_sessions, players, player_sessions, tonights_picks)
