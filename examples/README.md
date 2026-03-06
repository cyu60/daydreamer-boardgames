# Example Data

Sample JSON files showing the data format used by the BoardGameGeek scraper.

## Input Format (`games_input.json`)

Simple array of game names to scrape:

```json
[
  { "name": "Catan" },
  { "name": "Dominion" },
  { "name": "Wingspan" }
]
```

## Output Format (`games_output.json`)

Scraped game data with all fields populated:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Game title |
| `bgg_id` | string | BoardGameGeek ID |
| `min_players` | number | Minimum player count |
| `max_players` | number | Maximum player count |
| `play_time_minutes` | number | Average play time |
| `image_url` | string | Box art image URL |
| `description` | string | Game description |
| `tutorial_url` | string | YouTube tutorial link |
| `year_published` | number | Publication year |
| `rating` | number | BGG rating (1-10) |

## Usage

1. Create your input file with games to scrape
2. Run the scraper:
   ```bash
   cd boardgames-scraper
   ./boardgames-scraper scrape -i ../examples/games_input.json -o ../examples/games_output.json
   ```
3. Use the output to seed your Supabase database
