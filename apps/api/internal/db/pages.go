package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"ndzumamalate.com/apps/api/internal/models"

	"github.com/jackc/pgx/v5"
)

var pageKeyPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9_-]{0,63}$`)

// ValidPageKey reports whether key is a safe page_content identifier.
func ValidPageKey(key string) bool {
	return pageKeyPattern.MatchString(key)
}

func (s *Store) ListPageContent(ctx context.Context) ([]models.PageContent, error) {
	rows, err := s.pool.Query(ctx, `SELECT key, data, updated_at FROM page_content ORDER BY key ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.PageContent, 0)
	for rows.Next() {
		var item models.PageContent
		var data []byte
		if err := rows.Scan(&item.Key, &data, &item.UpdatedAt); err != nil {
			return nil, err
		}
		item.Data = json.RawMessage(data)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) GetPageContent(ctx context.Context, key string) (*models.PageContent, error) {
	item := &models.PageContent{}
	var data []byte
	err := s.pool.QueryRow(ctx, `SELECT key, data, updated_at FROM page_content WHERE key = $1`, key).Scan(&item.Key, &data, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	item.Data = json.RawMessage(data)
	return item, nil
}

func (s *Store) UpsertPageContent(ctx context.Context, key string, input models.PageContentInput) (*models.PageContent, error) {
	if !ValidPageKey(key) {
		return nil, fmt.Errorf("invalid page key")
	}
	raw := strings.TrimSpace(string(input.Data))
	if raw == "" {
		raw = "{}"
	}
	if !json.Valid([]byte(raw)) {
		return nil, fmt.Errorf("data must be valid json")
	}

	item := &models.PageContent{}
	var data []byte
	err := s.pool.QueryRow(ctx, `
		INSERT INTO page_content (key, data)
		VALUES ($1, $2::jsonb)
		ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
		RETURNING key, data, updated_at
	`, key, raw).Scan(&item.Key, &data, &item.UpdatedAt)
	if err != nil {
		return nil, err
	}
	item.Data = json.RawMessage(data)
	return item, nil
}
