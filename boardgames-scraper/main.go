package main

import (
	"fmt"
	"os"

	"github.com/cyu60/daydreamer-boardgames/boardgames-scraper/cmd"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
