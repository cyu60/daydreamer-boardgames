package cmd

import (
	"fmt"

	"github.com/cyu60/daydreamer-boardgames/boardgames-scraper/data"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var listInputFile string

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List games to be scraped or already scraped",
	Long: `List the games from the input or output file.

Examples:
  scraper list -i data/games_input.json   # List games to scrape
  scraper list -o data/games_output.json  # List scraped games`,
	RunE: runList,
}

func init() {
	listCmd.Flags().StringVarP(&listInputFile, "input", "i", "", "Input file with game names")
	listCmd.Flags().StringVarP(&outputFile, "output", "o", "", "Output file with scraped games")
	rootCmd.AddCommand(listCmd)
}

func runList(cmd *cobra.Command, args []string) error {
	cyan := color.New(color.FgCyan, color.Bold)
	magenta := color.New(color.FgMagenta)
	green := color.New(color.FgGreen)

	if listInputFile != "" {
		games, err := data.LoadGamesToScrape(listInputFile)
		if err != nil {
			return fmt.Errorf("failed to load input file: %w", err)
		}

		cyan.Printf("\n🎲 Games to Scrape (%d total)\n", len(games))
		fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		for i, g := range games {
			fmt.Printf("  %d. %s\n", i+1, magenta.Sprint(g.Name))
		}
		fmt.Println()
		return nil
	}

	if outputFile != "" {
		games, err := data.LoadScrapedGames(outputFile)
		if err != nil {
			return fmt.Errorf("failed to load output file: %w", err)
		}

		if len(games) == 0 {
			fmt.Println("No scraped games found.")
			return nil
		}

		cyan.Printf("\n🎲 Scraped Games (%d total)\n", len(games))
		fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		for _, g := range games {
			fmt.Printf("\n  %s\n", magenta.Sprint(g.Name))
			fmt.Printf("    Players: %d-%d\n", g.MinPlayers, g.MaxPlayers)
			fmt.Printf("    Time: %d min\n", g.PlayTimeMinutes)
			if g.Rating > 0 {
				fmt.Printf("    Rating: %.1f/10\n", g.Rating)
			}
			if g.TutorialURL != "" {
				green.Printf("    Tutorial: %s\n", g.TutorialURL)
			}
		}
		fmt.Println()
		return nil
	}

	return fmt.Errorf("please specify --input or --output file")
}
