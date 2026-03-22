package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	"ndzumamalate.com/apps/api/internal/models"
)

func (a *API) getF1Data(c echo.Context) error {
	ctx := c.Request().Context()
	cacheKey := "f1_widget_data"

	// Try cache
	if cachedData, err := a.cache.Get(ctx, cacheKey); err == nil && len(cachedData) > 0 {
		var data models.F1WidgetData
		if err := json.Unmarshal(cachedData, &data); err == nil {
			return c.JSON(http.StatusOK, data)
		}
	}

	// Fetch fresh data
	data, err := fetchF1Data(ctx)
	if err != nil {
		a.logger.Error("Failed to fetch F1 data", "error", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch F1 data"})
	}

	// Cache for 24 hours
	if jsonData, err := json.Marshal(data); err == nil {
		if setErr := a.cache.Set(ctx, cacheKey, jsonData, 24*time.Hour); setErr != nil {
			a.logger.Warn("Failed to cache F1 data", "error", setErr)
		}
	}

	return c.JSON(http.StatusOK, data)
}

func fetchF1Data(ctx context.Context) (*models.F1WidgetData, error) {
	meeting, err := fetchF1Meeting(ctx)
	if err != nil {
		return nil, err
	}
	time.Sleep(300 * time.Millisecond)

	teams, err := fetchF1Teams(ctx)
	if err != nil {
		return nil, err
	}
	time.Sleep(300 * time.Millisecond)

	drivers, err := fetchF1Drivers(ctx)
	if err != nil {
		return nil, err
	}

	return &models.F1WidgetData{
		Meeting: *meeting,
		Teams:   teams,
		Drivers: drivers,
	}, nil
}

func fetchF1Meeting(ctx context.Context) (*models.F1Meeting, error) {
	url := "https://api.openf1.org/v1/meetings?meeting_key=latest"
	body, err := doRequest(ctx, url)
	if err != nil {
		return nil, err
	}

	var raw []struct {
		MeetingName      string    `json:"meeting_name"`
		Location         string    `json:"location"`
		CountryName      string    `json:"country_name"`
		CountryFlag      string    `json:"country_flag"`
		CircuitShortName string    `json:"circuit_short_name"`
		CircuitImage     string    `json:"circuit_image"`
		DateStart        time.Time `json:"date_start"`
		DateEnd          time.Time `json:"date_end"`
	}

	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("decode meeting: %w", err)
	}

	if len(raw) == 0 {
		return nil, fmt.Errorf("no meeting data found")
	}

	// Assuming latest is the first or only entry
	m := raw[0]
	return &models.F1Meeting{
		MeetingName:      m.MeetingName,
		Location:         m.Location,
		CountryName:      m.CountryName,
		CountryFlag:      m.CountryFlag,
		CircuitShortName: m.CircuitShortName,
		CircuitImage:     m.CircuitImage,
		DateStart:        m.DateStart,
		DateEnd:          m.DateEnd,
	}, nil
}

func fetchF1Teams(ctx context.Context) ([]models.F1Team, error) {
	url := "https://api.openf1.org/v1/championship_teams?session_key=latest"
	body, err := doRequest(ctx, url)
	if err != nil {
		return nil, err
	}

	var raw []struct {
		PositionCurrent int     `json:"position_current"`
		TeamName        string  `json:"team_name"`
		PointsStart     float64 `json:"points_start"`
		PointsCurrent   float64 `json:"points_current"`
	}

	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("decode teams: %w", err)
	}

	sort.Slice(raw, func(i, j int) bool {
		return raw[i].PositionCurrent < raw[j].PositionCurrent
	})

	limit := 5
	if len(raw) < limit {
		limit = len(raw)
	}

	var teams []models.F1Team
	for i := 0; i < limit; i++ {
		teams = append(teams, models.F1Team{
			PositionCurrent: raw[i].PositionCurrent,
			TeamName:        raw[i].TeamName,
			PointsStart:     raw[i].PointsStart,
			PointsCurrent:   raw[i].PointsCurrent,
		})
	}
	return teams, nil
}

func fetchF1Drivers(ctx context.Context) ([]models.F1Driver, error) {
	// 1. Get driver championship points
	champUrl := "https://api.openf1.org/v1/championship_drivers?session_key=latest"
	champBody, err := doRequest(ctx, champUrl)
	if err != nil {
		return nil, err
	}

	var champRaw []struct {
		PositionCurrent int     `json:"position_current"`
		DriverNumber    int     `json:"driver_number"`
		PointsStart     float64 `json:"points_start"`
		PointsCurrent   float64 `json:"points_current"`
	}

	if err := json.Unmarshal(champBody, &champRaw); err != nil {
		return nil, fmt.Errorf("decode champ drivers: %w", err)
	}

	sort.Slice(champRaw, func(i, j int) bool {
		return champRaw[i].PositionCurrent < champRaw[j].PositionCurrent
	})

	limit := 5
	if len(champRaw) < limit {
		limit = len(champRaw)
	}

	// 2. Get driver info (name, team) for the top 5
	time.Sleep(300 * time.Millisecond)
	driversUrl := "https://api.openf1.org/v1/drivers?session_key=latest"
	driversBody, err := doRequest(ctx, driversUrl)
	if err != nil {
		return nil, err
	}

	var driversRaw []struct {
		DriverNumber int    `json:"driver_number"`
		FullName     string `json:"full_name"`
		TeamName     string `json:"team_name"`
		TeamColour   string `json:"team_colour"`
	}

	if err := json.Unmarshal(driversBody, &driversRaw); err != nil {
		return nil, fmt.Errorf("decode driver details: %w", err)
	}

	driverMap := make(map[int]struct {
		FullName   string
		TeamName   string
		TeamColour string
	})
	for _, d := range driversRaw {
		driverMap[d.DriverNumber] = struct {
			FullName   string
			TeamName   string
			TeamColour string
		}{
			FullName:   d.FullName,
			TeamName:   d.TeamName,
			TeamColour: d.TeamColour,
		}
	}

	var drivers []models.F1Driver
	for i := 0; i < limit; i++ {
		c := champRaw[i]
		info := driverMap[c.DriverNumber]

		drivers = append(drivers, models.F1Driver{
			PositionCurrent: c.PositionCurrent,
			DriverNumber:    c.DriverNumber,
			PointsStart:     c.PointsStart,
			PointsCurrent:   c.PointsCurrent,
			FullName:        info.FullName,
			TeamName:        info.TeamName,
			TeamColour:      info.TeamColour,
		})
	}
	return drivers, nil
}

func doRequest(ctx context.Context, url string) ([]byte, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	var res *http.Response
	var err error

	for i := 0; i < 3; i++ {
		req, errReq := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if errReq != nil {
			return nil, errReq
		}

		res, err = client.Do(req)
		if err != nil {
			return nil, err
		}

		if res.StatusCode == http.StatusOK {
			defer res.Body.Close()
			return io.ReadAll(res.Body)
		}

		res.Body.Close()

		if res.StatusCode == http.StatusTooManyRequests {
			time.Sleep(time.Duration(i+1) * 500 * time.Millisecond)
			continue
		}

		return nil, fmt.Errorf("unexpected status %d for url %s", res.StatusCode, url)
	}

	return nil, fmt.Errorf("unexpected status %d for url %s after retries", res.StatusCode, url)
}
