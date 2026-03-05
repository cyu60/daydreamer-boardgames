package cmd

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"github.com/cyu60/daydreamer-boardgames/boardgames-scraper/client"
	"github.com/cyu60/daydreamer-boardgames/boardgames-scraper/data"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	inputFile  string
	outputFile string
	showLive   bool
)

var scrapeCmd = &cobra.Command{
	Use:   "scrape",
	Short: "Scrape board game data from BoardGameGeek",
	Long: `Scrape board game information from BoardGameGeek using Browser Use.

Reads a list of game names from an input file and scrapes:
- Name, player count, play time
- Box art image URL
- Description
- YouTube tutorial link (if available)

Examples:
  scraper scrape -i games_input.json -o games_output.json
  scraper scrape --input data/my_games.json --live`,
	RunE: runScrape,
}

func init() {
	scrapeCmd.Flags().StringVarP(&inputFile, "input", "i", "data/games_input.json", "Input file with game names to scrape")
	scrapeCmd.Flags().StringVarP(&outputFile, "output", "o", "data/games_output.json", "Output file for scraped game data")
	scrapeCmd.Flags().BoolVar(&showLive, "live", false, "Show live browser view URL")
	rootCmd.AddCommand(scrapeCmd)
}

func runScrape(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan, color.Bold)
	green := color.New(color.FgGreen)
	yellow := color.New(color.FgYellow)
	magenta := color.New(color.FgMagenta)

	cyan.Println("\n🎲 Daydreamer Board Games Scraper")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Load games to scrape
	games, err := data.LoadGamesToScrape(inputFile)
	if err != nil {
		return fmt.Errorf("failed to load input file: %w", err)
	}

	fmt.Printf("Found %d games to scrape:\n", len(games))
	for _, g := range games {
		fmt.Printf("  - %s\n", magenta.Sprint(g.Name))
	}
	fmt.Println()

	// Create browser-use client
	c := client.New(apiKey)

	// Create session
	yellow.Println("Creating browser session...")
	session, err := c.CreateSession(profileID)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	defer c.CloseSession(session.ID)

	if showLive && session.LiveURL != "" {
		green.Printf("\n🖥  Live view: %s\n\n", session.LiveURL)
	}

	// Build the scrape task
	gameNames := make([]string, len(games))
	for i, g := range games {
		gameNames[i] = g.Name
	}

	scrapeTask := fmt.Sprintf(`You are scraping board game data from BoardGameGeek (boardgamegeek.com).

For EACH of these games: %s

Do the following steps:

1. Go to boardgamegeek.com
2. Search for the game name
3. Click on the correct game result
4. Extract the following information:
   - Game name (exact title)
   - Minimum players
   - Maximum players
   - Playing time (in minutes)
   - Box art image URL (the main game image)
   - Description (first paragraph)
   - Year published
   - BGG rating (out of 10)
   - BGG ID (from the URL, e.g., boardgamegeek.com/boardgame/36218 -> 36218)

5. Also search YouTube for "[game name] how to play tutorial" and get the first result URL

Return ALL games as a JSON array with this exact format:
'''json
[
  {
    "name": "Game Name",
    "bgg_id": "12345",
    "min_players": 2,
    "max_players": 4,
    "play_time_minutes": 45,
    "image_url": "https://...",
    "description": "Description text...",
    "tutorial_url": "https://youtube.com/watch?v=...",
    "year_published": 2020,
    "rating": 7.5
  }
]
'''

IMPORTANT:
- Return valid JSON that can be parsed
- Include ALL %d games in the response
- If you can't find a field, use null
- Make sure image_url is the actual image URL, not the page URL`, strings.Join(gameNames, ", "), len(games))

	// Create and wait for task
	yellow.Println("Scraping BoardGameGeek... (this may take several minutes)")
	task, err := c.CreateTask(session.ID, scrapeTask)
	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}

	spinner := []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
	spinIdx := 0

	status, err := c.WaitForTask(task.ID, func(s string) {
		if verbose {
			fmt.Printf("\r%s Status: %s   ", spinner[spinIdx], s)
			spinIdx = (spinIdx + 1) % len(spinner)
		}
	})
	if err != nil {
		return fmt.Errorf("task failed: %w", err)
	}

	fmt.Println()

	if status.Status == "failed" || status.Status == "stopped" {
		errOutput := status.Output
		if errOutput == "" {
			errOutput = status.Result
		}
		if errOutput == "" {
			errOutput = status.FinalResult
		}
		color.Red("Scrape failed: %s", errOutput)
		return fmt.Errorf("scrape failed")
	}

	green.Println("✓ Scrape complete!")

	// Parse output
	output := status.Output
	if output == "" {
		output = status.Result
	}
	if output == "" {
		output = status.FinalResult
	}

	// Extract JSON from output
	re := regexp.MustCompile(`\[[\s\S]*\]`)
	match := re.FindString(output)
	if match == "" {
		fmt.Println("\nRaw output:")
		fmt.Println(output)
		return fmt.Errorf("no JSON array found in output")
	}

	// Clean up escaped quotes
	match = strings.ReplaceAll(match, `\"`, `"`)
	match = strings.ReplaceAll(match, `\\`, `\`)

	var scrapedGames []data.Game
	if err := json.Unmarshal([]byte(match), &scrapedGames); err != nil {
		fmt.Println("\nRaw JSON:")
		fmt.Println(match)
		return fmt.Errorf("failed to parse scraped games: %w", err)
	}

	// Save to output file
	if err := data.SaveScrapedGames(scrapedGames, outputFile); err != nil {
		return fmt.Errorf("failed to save games: %w", err)
	}

	green.Printf("\n✓ Saved %d games to %s\n", len(scrapedGames), outputFile)

	// Print summary
	fmt.Println("\nScraped Games:")
	fmt.Println("━━━━━━━━━━━━━━")
	for _, g := range scrapedGames {
		fmt.Printf("  %s (%d-%d players, %d min)\n",
			magenta.Sprint(g.Name),
			g.MinPlayers,
			g.MaxPlayers,
			g.PlayTimeMinutes)
	}

	return nil
}
