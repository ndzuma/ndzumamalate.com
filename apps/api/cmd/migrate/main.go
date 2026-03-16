package main

import (
	"context"
	"log"

	"ndzumamalate.com/apps/api/internal/config"
	"ndzumamalate.com/apps/api/internal/db"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	if err := db.RunMigrations(context.Background(), cfg.DatabaseURL); err != nil {
		log.Fatal(err)
	}
}
