# PRD: Photo-to-Game Feature

## Overview
Allow users to take a photo of a board game box, have AI identify the game, automatically scrape BoardGameGeek for details, and add it to their collection.

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. TAP "Add Game" → 2. TAKE PHOTO → 3. PROCESSING → 4. CONFIRM   │
│                                                                     │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐   │
│  │  + Add  │ ──▶  │  📷    │ ──▶  │ ⏳ AI   │ ──▶  │ ✓ Add   │   │
│  │  Game   │      │ Camera  │      │ Working │      │  Game?  │   │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘   │
│                                                                     │
│                         ↓ on failure                                │
│                   ┌─────────────┐                                   │
│                   │ Manual Entry│                                   │
│                   │ (fallback)  │                                   │
│                   └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FRONTEND (Next.js)                                                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ 1. Camera/Upload UI                                             │ │
│  │ 2. Upload image to Supabase Storage                            │ │
│  │ 3. Call /api/identify-game                                     │ │
│  │ 4. Poll /api/game-task/[taskId] for status                     │ │
│  │ 5. Show result or fallback to manual                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  BACKEND (Next.js API Routes)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │  POST /api/identify-game                                        │ │
│  │  ├── Receive image URL                                          │ │
│  │  ├── Call Claude Vision API to identify game name               │ │
│  │  ├── Create task record in DB (status: pending)                 │ │
│  │  ├── Trigger async browser-use scraping                         │ │
│  │  └── Return taskId immediately                                  │ │
│  │                                                                 │ │
│  │  GET /api/game-task/[taskId]                                    │ │
│  │  ├── Return current status: pending | scraping | complete | error│
│  │  └── Return game data when complete                             │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                       │
│                              ▼                                       │
│  EXTERNAL SERVICES                                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ OpenAI GPT-4V         → Identify game name from photo           │ │
│  │ browser-use.com API   → Scrape BGG for game details             │ │
│  │ Supabase Storage      → Store uploaded images                   │ │
│  │ Supabase DB           → Store tasks & game data                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### New Table: `game_tasks`

```sql
CREATE TABLE game_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'identifying', 'scraping', 'complete', 'error')),
  image_url TEXT NOT NULL,
  identified_name TEXT,           -- Name from Claude Vision
  confidence REAL,                -- Confidence score 0-1
  bgg_url TEXT,                   -- BGG URL found
  game_id UUID REFERENCES games(id), -- Resulting game (when complete)
  error_message TEXT,             -- Error details if failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

## API Endpoints

### POST `/api/identify-game`

**Request:**
```json
{
  "imageUrl": "https://supabase.../storage/game-photos/abc123.jpg"
}
```

**Response:**
```json
{
  "taskId": "uuid-here",
  "status": "pending"
}
```

### GET `/api/game-task/[taskId]`

**Response (pending/scraping):**
```json
{
  "taskId": "uuid",
  "status": "scraping",
  "identifiedName": "Wingspan",
  "message": "Scraping BoardGameGeek..."
}
```

**Response (complete):**
```json
{
  "taskId": "uuid",
  "status": "complete",
  "game": {
    "id": "uuid",
    "name": "Wingspan",
    "min_players": 1,
    "max_players": 5,
    "play_time_minutes": 70,
    "image_url": "https://...",
    "description": "...",
    "tutorial_url": "https://youtube.com/..."
  }
}
```

**Response (error):**
```json
{
  "taskId": "uuid",
  "status": "error",
  "error": "Could not identify game from photo",
  "allowManualEntry": true
}
```

## OpenAI Vision API (GPT-5.4 - Latest)

**Why OpenAI:** User preference for this project.

**Model:** `gpt-5.4` - OpenAI's latest model (released March 2026) with best-in-class vision:
- Supports 10M+ pixel images without compression
- 75% OSWorld score (better than human testers at 72.4%)
- Significantly improved at processing image prompts

**API Call:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: "gpt-5.4",  // Latest vision model (March 2026)
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `You are a board game identification expert. Analyze this image of a board game box and identify the game.

Return a JSON response with:
{
  "name": "Exact game name as it would appear on BoardGameGeek",
  "confidence": 0.95,
  "reasoning": "Brief explanation of how you identified it"
}

If you cannot identify the game, return:
{
  "name": null,
  "confidence": 0,
  "reasoning": "Explanation of why identification failed"
}

Focus on: the main title, publisher logos, distinctive artwork, edition/version if visible.`
        },
        {
          type: "image_url",
          image_url: { url: imageUrl }
        }
      ]
    }
  ],
  max_tokens: 300
});
```

## Implementation Steps

### Phase 1: Database & Storage Setup
1. Create `game_tasks` table migration
2. Set up Supabase Storage bucket for game photos
3. Add RLS policies for storage

### Phase 2: Image Upload UI
1. Add camera/upload button to "My Games" tab
2. Implement image capture (mobile camera or file upload)
3. Upload to Supabase Storage
4. Show upload progress

### Phase 3: OpenAI Vision Integration
1. Create `/api/identify-game` endpoint
2. Integrate OpenAI SDK with GPT-4V vision
3. Parse response and create task record
4. Return taskId to frontend

### Phase 4: Browser-use Integration
1. Trigger browser-use API to scrape BGG
2. Use existing scraper logic from Go CLI
3. Update task status during scraping
4. Parse and store game data

### Phase 5: Frontend Polling & UI
1. Poll `/api/game-task/[taskId]` every 2 seconds
2. Show progress states (identifying → scraping → complete)
3. Display confirmation modal with game details
4. "Add to Collection" button
5. Fallback to manual entry on error

### Phase 6: Manual Entry Fallback
1. Form for manual game details
2. Optional: trigger browser-use with manual name
3. Or: allow fully manual entry

## Environment Variables Required

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# New
OPENAI_API_KEY=...           # For GPT-4V image recognition
BROWSER_USE_API_KEY=...
BROWSER_USE_PROFILE_ID=...   # optional
```

## UI Mockups

### Add Game Modal States

```
┌─────────────────────────────────┐
│         Add New Game            │
├─────────────────────────────────┤
│                                 │
│     ┌───────────────────┐       │
│     │                   │       │
│     │      📷          │       │
│     │   Take Photo      │       │
│     │                   │       │
│     └───────────────────┘       │
│                                 │
│     ┌───────────────────┐       │
│     │   📁 Upload File   │       │
│     └───────────────────┘       │
│                                 │
│     ─────── or ───────          │
│                                 │
│     ┌───────────────────┐       │
│     │ ✏️ Enter Manually  │       │
│     └───────────────────┘       │
│                                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Identifying Game...        │
├─────────────────────────────────┤
│                                 │
│     ┌───────────────────┐       │
│     │ [game photo here] │       │
│     └───────────────────┘       │
│                                 │
│     🔍 Analyzing image...       │
│     ━━━━━━━━━━░░░░░░░░░░ 40%    │
│                                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│      Game Found!                │
├─────────────────────────────────┤
│                                 │
│  ┌─────┐  Wingspan              │
│  │ img │  1-5 players · 70 min  │
│  └─────┘  ⭐ 8.1 on BGG          │
│                                 │
│  A competitive, medium-weight,  │
│  card-driven, engine-building   │
│  board game...                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │   ✓ Add to Collection   │    │
│  └─────────────────────────┘    │
│                                 │
│     Not the right game?         │
│     [Try again] [Enter manually]│
│                                 │
└─────────────────────────────────┘
```

## Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| Image too blurry | "Couldn't read the game box. Try a clearer photo." | Retry or manual |
| Game not recognized | "We couldn't identify this game." | Manual entry |
| BGG scraping failed | "Found game but couldn't get details." | Add with partial info |
| Network error | "Connection error. Please try again." | Retry |

## Success Metrics
- 80%+ successful auto-identification rate
- < 60 second end-to-end time
- < 5% require manual fallback after photo attempt

## Timeline Estimate
- Phase 1-2: Foundation (DB, Storage, Upload UI)
- Phase 3: Claude Vision integration
- Phase 4: Browser-use integration
- Phase 5-6: Polish and fallback

## Open Questions
1. Should we cache BGG results to avoid re-scraping the same game?
2. Should we support batch photo upload (multiple games)?
3. Do we need image preprocessing (crop, enhance)?
