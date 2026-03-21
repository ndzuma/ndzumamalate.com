package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"ndzumamalate.com/apps/api/internal/auth"
	"ndzumamalate.com/apps/api/internal/cms"
	"ndzumamalate.com/apps/api/internal/config"
	"ndzumamalate.com/apps/api/internal/db"
	"ndzumamalate.com/apps/api/internal/handlers"
	"ndzumamalate.com/apps/api/internal/logging"
	"ndzumamalate.com/apps/api/internal/notifications"
	"ndzumamalate.com/apps/api/internal/realtime"

	"github.com/labstack/echo/v4"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	logger := logging.NewLogger("api")

	if err := run(ctx); err != nil && !errors.Is(err, context.Canceled) {
		logger.Error("server exited", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	logger := logging.NewLogger("api")
	cfg, err := config.Load()
	if err != nil {
		return err
	}
	logger.Info("configuration loaded", slog.String("app_env", cfg.AppEnv), slog.String("port", cfg.Port))

	if err := db.RunMigrations(ctx, cfg.DatabaseURL); err != nil {
		return err
	}
	logger.Info("database migrations applied")

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
	logger.Info("dependencies connected")

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
		logger.Info("bootstrap admin processed", slog.String("email", email))
	}

	authService := auth.NewService(cfg.JWTIssuer, cfg.AccessTTL, cfg.RefreshTTL, cfg.PrivateKey, redisStore, cfg.CookieDomain, cfg.CookieSecure)
	broker := realtime.NewBroker()

	allowedOrigins := []string{}
	if cfg.AppEnv == "development" {
		allowedOrigins = []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"}
	} else {
		allowedOrigins = []string{"https://ndzumamalate.com", "https://web-production-bd469.up.railway.app"}
	}

	api := handlers.NewAPI(
		store,
		authService,
		broker,
		notifications.NewDispatcher(store, cfg.WebhookTargets, cfg.WebhookSecret, logger),
		notifications.NewResendClient(cfg.ResendAPIKey, cfg.ContactFromEmail, cfg.ContactToEmail, logger),
		cfg.RateLimitMax,
		cfg.RateLimitWindow,
		allowedOrigins,
		logger,
	)

	e := echo.New()
	api.Register(e)
	if err := cms.Register(e); err != nil {
		return err
	}

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("server starting", slog.String("addr", ":"+cfg.Port))
		s := &http.Server{
			Addr:              ":" + cfg.Port,
			Handler:           e,
			ReadTimeout:       15 * time.Second,
			WriteTimeout:      15 * time.Second,
			IdleTimeout:       60 * time.Second,
			ReadHeaderTimeout: 10 * time.Second,
		}
		serverErr <- e.StartServer(s)
	}()

	select {
	case <-ctx.Done():
		logger.Info("server shutting down")
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
