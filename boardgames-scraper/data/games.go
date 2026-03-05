package data

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Game represents a board game with all its metadata
type Game struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	BGGId           string `json:"bgg_id,omitempty"`
	MinPlayers      int    `json:"min_players"`
	MaxPlayers      int    `json:"max_players"`
	PlayTimeMinutes int    `json:"play_time_minutes"`
	ImageURL        string `json:"image_url,omitempty"`
	Description     string `json:"description,omitempty"`
	TutorialURL     string `json:"tutorial_url,omitempty"`
	YearPublished   int    `json:"year_published,omitempty"`
	Rating          float64 `json:"rating,omitempty"`
}

// GameInput represents a game to be scraped
type GameInput struct {
	Name string `json:"name"`
}

// GetDataDir returns the data directory path
func GetDataDir() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Join(filepath.Dir(execPath), "..", "data"), nil
}

// LoadGamesToScrape loads the list of games to scrape from games_input.json
func LoadGamesToScrape(filePath string) ([]GameInput, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read games input file: %w", err)
	}

	var games []GameInput
	if err := json.Unmarshal(data, &games); err != nil {
		return nil, fmt.Errorf("failed to parse games input: %w", err)
	}

	return games, nil
}

// SaveScrapedGames saves scraped games to a JSON file
func SaveScrapedGames(games []Game, filePath string) error {
	data, err := json.MarshalIndent(games, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal games: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write games file: %w", err)
	}

	return nil
}

// LoadScrapedGames loads previously scraped games from a JSON file
func LoadScrapedGames(filePath string) ([]Game, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []Game{}, nil
		}
		return nil, fmt.Errorf("failed to read games file: %w", err)
	}

	var games []Game
	if err := json.Unmarshal(data, &games); err != nil {
		return nil, fmt.Errorf("failed to parse games: %w", err)
	}

	return games, nil
}
