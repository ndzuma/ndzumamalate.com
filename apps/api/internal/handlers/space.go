package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	"ndzumamalate.com/apps/api/internal/models"
)

func (a *API) getSpaceData(c echo.Context) error {
	ctx := c.Request().Context()
	cacheKey := "space_widget_data"

	// Try cache
	if cachedData, err := a.cache.Get(ctx, cacheKey); err == nil && len(cachedData) > 0 {
		var data models.SpaceLaunch
		if err := json.Unmarshal(cachedData, &data); err == nil {
			// Verify the cached launch is still in the future!
			// If the cached launch already happened, skip cache and fetch fresh data.
			if data.Net.After(time.Now()) {
				return c.JSON(http.StatusOK, data)
			}
		}
	}

	// Fetch fresh data
	data, err := fetchSpaceData(ctx)
	if err != nil {
		a.logger.Error("Failed to fetch Space data", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch Space data"})
	}

	// Cache for 6 hours
	if jsonData, err := json.Marshal(data); err == nil {
		if setErr := a.cache.Set(ctx, cacheKey, jsonData, 6*time.Hour); setErr != nil {
			a.logger.Warn("Failed to cache Space data", "error", setErr)
		}
	}

	return c.JSON(http.StatusOK, data)
}

func fetchSpaceData(ctx context.Context) (*models.SpaceLaunch, error) {
	providers := []string{
		"SpaceX",
		"Blue+Origin",
		"Rocket+Lab",
		"United+Launch+Alliance",
	}

	var allLaunches []models.SpaceLaunch
	now := time.Now()

	for _, provider := range providers {
		url := fmt.Sprintf("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?lsp__name=%s&mode=detailed&limit=3", provider)

		body, err := doRequest(ctx, url)
		if err != nil {
			// Log but continue to other providers if one fails
			fmt.Printf("Failed to fetch for provider %s: %v\n", provider, err)
			continue
		}

		// Define the raw response structure matching the JSON
		var raw struct {
			Results []struct {
				Name                  string `json:"name"`
				LaunchServiceProvider struct {
					Name    string `json:"name"`
					LogoURL string `json:"logo_url"`
				} `json:"launch_service_provider"`
				Rocket struct {
					Configuration struct {
						ImageURL string `json:"image_url"`
					} `json:"configuration"`
				} `json:"rocket"`
				Pad struct {
					Name     string `json:"name"`
					Location struct {
						Name string `json:"name"`
					} `json:"location"`
				} `json:"pad"`
				Net     time.Time `json:"net"`
				URL     string    `json:"url"`
				VidURLs []struct {
					URL string `json:"url"`
				} `json:"vidURLs"`
			} `json:"results"`
		}

		if err := json.Unmarshal(body, &raw); err != nil {
			fmt.Printf("Failed to decode for provider %s: %v\n", provider, err)
			continue
		}

		for _, res := range raw.Results {
			// Only consider launches that are strictly in the future
			if res.Net.After(now) {
				streamURL := ""
				if len(res.VidURLs) > 0 {
					streamURL = res.VidURLs[0].URL
				}

				allLaunches = append(allLaunches, models.SpaceLaunch{
					Name:         res.Name,
					Provider:     res.LaunchServiceProvider.Name,
					ProviderLogo: res.LaunchServiceProvider.LogoURL,
					Image:        res.Rocket.Configuration.ImageURL,
					Pad:          res.Pad.Name,
					Location:     res.Pad.Location.Name,
					Net:          res.Net,
					StreamURL:    streamURL,
					InfoURL:      res.URL,
				})
			}
		}

		// Sleep between requests to respect rate limits
		time.Sleep(500 * time.Millisecond)
	}

	if len(allLaunches) == 0 {
		return nil, fmt.Errorf("no upcoming space launch found across requested providers")
	}

	// Sort by Net time ascending to find the absolute closest one
	sort.Slice(allLaunches, func(i, j int) bool {
		return allLaunches[i].Net.Before(allLaunches[j].Net)
	})

	return &allLaunches[0], nil
}
