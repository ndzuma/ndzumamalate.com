package handlers

import (
	"net/http"
	"time"

	"ndzumamalate.com/apps/api/internal/db"
	"ndzumamalate.com/apps/api/internal/models"

	"github.com/labstack/echo/v4"
)

const contentVersionKey = "content:version"

func (a *API) listPageContent(c echo.Context) error {
	items, err := a.store.ListPageContent(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) getPageContent(c echo.Context) error {
	key := c.Param("key")
	if !db.ValidPageKey(key) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid page key")
	}
	item, err := a.store.GetPageContent(c.Request().Context(), key)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "page not found")
	}
	return c.JSON(http.StatusOK, item)
}

func (a *API) upsertPageContent(c echo.Context) error {
	key := c.Param("key")
	if !db.ValidPageKey(key) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid page key")
	}
	var input models.PageContentInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	item, err := a.store.UpsertPageContent(c.Request().Context(), key, input)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	a.publishEvent(c, "page.updated", "pages", "updated", item.Key, item)
	return c.JSON(http.StatusOK, item)
}

// getVersion exposes a monotonic content version so consumers (the Next.js
// sync layer) can detect changes they may have missed while disconnected.
func (a *API) getVersion(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{
		"version":      a.currentVersion(c),
		"generated_at": time.Now().UTC(),
	})
}

func (a *API) currentVersion(c echo.Context) int64 {
	raw, err := a.cache.Get(c.Request().Context(), contentVersionKey)
	if err != nil || len(raw) == 0 {
		return 0
	}
	var version int64
	for _, ch := range raw {
		if ch < '0' || ch > '9' {
			return 0
		}
		version = version*10 + int64(ch-'0')
	}
	return version
}

func (a *API) bumpVersion(c echo.Context) int64 {
	version, err := a.cache.Incr(c.Request().Context(), contentVersionKey)
	if err != nil {
		a.logger.Warn("failed to bump content version", "error", err)
		return time.Now().UnixMilli()
	}
	return version
}
