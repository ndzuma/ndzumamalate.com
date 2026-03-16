package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

func RunMigrations(ctx context.Context, databaseURL string) error {
	if strings.TrimSpace(databaseURL) == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return fmt.Errorf("connect postgres: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("ping postgres: %w", err)
	}

	paths, err := migrationFiles()
	if err != nil {
		return err
	}

	for _, path := range paths {
		contents, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", path, err)
		}
		if strings.TrimSpace(string(contents)) == "" {
			continue
		}
		if _, err := pool.Exec(ctx, string(contents)); err != nil {
			return fmt.Errorf("apply migration %s: %w", filepath.Base(path), err)
		}
	}

	return nil
}

func migrationFiles() ([]string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	candidates := []string{
		filepath.Join(wd, "migrations", "*.sql"),
		filepath.Join(wd, "..", "..", "migrations", "*.sql"),
	}

	for _, pattern := range candidates {
		matches, err := filepath.Glob(pattern)
		if err != nil {
			return nil, err
		}
		if len(matches) > 0 {
			sort.Strings(matches)
			return matches, nil
		}
	}

	return nil, fmt.Errorf("no migration files found")
}
