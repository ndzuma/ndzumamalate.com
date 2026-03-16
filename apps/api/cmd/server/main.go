package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"ndzumamalate.com/apps/api/internal/auth"
	"ndzumamalate.com/apps/api/internal/config"
	"ndzumamalate.com/apps/api/internal/db"
	"ndzumamalate.com/apps/api/internal/handlers"
	"ndzumamalate.com/apps/api/internal/notifications"
	"ndzumamalate.com/apps/api/internal/realtime"

	"github.com/labstack/echo/v4"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	if err := db.RunMigrations(ctx, cfg.DatabaseURL); err != nil {
		return err
	}

	store, err := db.NewStore(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer store.Close()

	redisStore, err := auth.NewRedisStore(cfg.RedisURL)
	if err != nil {
		return err
	}
	defer redisStore.Close()

	if err := redisStore.Ping(ctx); err != nil {
		return err
	}

	if email := os.Getenv("BOOTSTRAP_ADMIN_EMAIL"); email != "" {
		password := os.Getenv("BOOTSTRAP_ADMIN_PASSWORD")
		if password == "" {
			return errors.New("BOOTSTRAP_ADMIN_PASSWORD is required when BOOTSTRAP_ADMIN_EMAIL is set")
		}
		hash, err := auth.HashPassword(password)
		if err != nil {
			return err
		}
		_, _, err = store.BootstrapAdmin(ctx, email, hash)
		if err != nil {
			return err
		}
	}

	authService := auth.NewService(cfg.JWTIssuer, cfg.AccessTTL, cfg.RefreshTTL, cfg.PrivateKey, redisStore, cfg.CookieDomain, cfg.CookieSecure)
	broker := realtime.NewBroker()
	api := handlers.NewAPI(
		store,
		authService,
		broker,
		notifications.NewDispatcher(store, cfg.WebhookTargets, cfg.WebhookSecret),
		notifications.NewResendClient(cfg.ResendAPIKey, cfg.ContactFromEmail, cfg.ContactToEmail),
		cfg.RateLimitMax,
		cfg.RateLimitWindow,
	)

	e := echo.New()
	api.Register(e)

	serverErr := make(chan error, 1)
	go func() {
		serverErr <- e.Start(":" + cfg.Port)
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return e.Shutdown(shutdownCtx)
	case err := <-serverErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}
