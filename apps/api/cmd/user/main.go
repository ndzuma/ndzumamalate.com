package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"ndzumamalate.com/apps/api/internal/auth"
	"ndzumamalate.com/apps/api/internal/config"
	"ndzumamalate.com/apps/api/internal/db"
)

func main() {
	var (
		email    = flag.String("email", "", "admin email")
		password = flag.String("password", "", "password")
		change   = flag.Bool("change-password", false, "change password for existing admin")
	)
	flag.Parse()

	if *email == "" || *password == "" {
		log.Fatal("-email and -password are required")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	if err := db.RunMigrations(context.Background(), cfg.DatabaseURL); err != nil {
		log.Fatal(err)
	}

	store, err := db.NewStore(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer store.Close()

	hash, err := auth.HashPassword(*password)
	if err != nil {
		log.Fatal(err)
	}

	if *change {
		user, err := store.GetAdminByEmail(context.Background(), *email)
		if err != nil {
			log.Fatal(err)
		}
		if user == nil {
			log.Fatalf("admin user %s not found", *email)
		}
		if err := store.UpdateAdminPassword(context.Background(), user.ID, hash); err != nil {
			log.Fatal(err)
		}
		fmt.Fprintf(os.Stdout, "password updated for %s\n", *email)
		return
	}

	_, created, err := store.BootstrapAdmin(context.Background(), *email, hash)
	if err != nil {
		log.Fatal(err)
	}
	if !created {
		log.Fatalf("admin already exists; use -change-password to update it")
	}
	fmt.Fprintf(os.Stdout, "admin created for %s\n", *email)
}
