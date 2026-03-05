package cmd

import (
	"fmt"
	"os"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var (
	apiKey    string
	profileID string
	verbose   bool
)

var rootCmd = &cobra.Command{
	Use:   "scraper",
	Short: "BoardGameGeek scraper for Daydreamer Board Games",
	Long: color.New(color.FgCyan, color.Bold).Sprint(`
  ____                      _
 |  _ \  __ _ _   _     ___| |_ _ __ ___  __ _ _ __ ___   ___ _ __
 | | | |/ _' | | | |   / __| __| '__/ _ \/ _' | '_ ' _ \ / _ \ '__|
 | |_| | (_| | |_| |   \__ \ |_| | |  __/ (_| | | | | | |  __/ |
 |____/ \__,_|\__, |   |___/\__|_|  \___|\__,_|_| |_| |_|\___|_|
              |___/
`) + `
Scrape board game data from BoardGameGeek using Browser Use.

Set environment variables:
  BROWSER_USE_API_KEY     - Your Browser Use API key
  BROWSER_USE_PROFILE_ID  - Browser profile ID (optional)`,
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		if apiKey == "" {
			apiKey = os.Getenv("BROWSER_USE_API_KEY")
		}
		if profileID == "" {
			profileID = os.Getenv("BROWSER_USE_PROFILE_ID")
		}
		if apiKey == "" && cmd.Name() != "help" && cmd.Name() != "version" && cmd.Name() != "list" {
			return fmt.Errorf("API key required. Set BROWSER_USE_API_KEY env var or use --api-key flag")
		}
		return nil
	},
}

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	rootCmd.PersistentFlags().StringVar(&apiKey, "api-key", "", "Browser Use API key (or set BROWSER_USE_API_KEY)")
	rootCmd.PersistentFlags().StringVar(&profileID, "profile", "", "Browser Use profile ID (or set BROWSER_USE_PROFILE_ID)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output")
}
