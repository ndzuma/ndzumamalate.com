package logging

import (
	"log/slog"
	"time"

	"github.com/labstack/echo/v4"
)

func RequestLogger(logger *slog.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			err := next(c)
			if err != nil {
				c.Error(err)
			}

			fields := []any{
				slog.String("request_id", c.Response().Header().Get(echo.HeaderXRequestID)),
				slog.String("method", c.Request().Method),
				slog.String("path", c.Path()),
				slog.String("uri", c.Request().RequestURI),
				slog.Int("status", c.Response().Status),
				slog.Int64("bytes_out", c.Response().Size),
				slog.String("ip", c.RealIP()),
				slog.String("user_agent", c.Request().UserAgent()),
				slog.Int64("duration_ms", time.Since(start).Milliseconds()),
			}

			if err != nil {
				fields = append(fields, slog.String("error", err.Error()))
				logger.Error("request failed", fields...)
				return nil
			}

			logger.Info("request completed", fields...)
			return nil
		}
	}
}
