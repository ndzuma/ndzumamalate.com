package notifications

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"ndzumamalate.com/apps/api/internal/models"
)

type WebhookSource interface {
	ListActiveWebhookEndpoints(ctx context.Context) ([]models.WebhookEndpoint, error)
}

type Dispatcher struct {
	store         WebhookSource
	staticTargets []models.WebhookEndpoint
	httpClient    *http.Client
	logger        *slog.Logger
}

func NewDispatcher(store WebhookSource, targets []string, sharedSecret string, logger *slog.Logger) *Dispatcher {
	staticTargets := make([]models.WebhookEndpoint, 0, len(targets))
	for _, target := range targets {
		trimmed := strings.TrimSpace(target)
		if trimmed == "" {
			continue
		}
		staticTargets = append(staticTargets, models.WebhookEndpoint{URL: trimmed, Secret: sharedSecret, IsActive: true})
	}

	return &Dispatcher{
		store:         store,
		staticTargets: staticTargets,
		httpClient:    &http.Client{Timeout: 5 * time.Second},
		logger:        logger,
	}
}

func (d *Dispatcher) Dispatch(ctx context.Context, event models.Event) {
	if d == nil {
		return
	}
	payload, err := json.Marshal(event)
	if err != nil {
		return
	}

	targets := append([]models.WebhookEndpoint{}, d.staticTargets...)
	if d.store != nil {
		items, err := d.store.ListActiveWebhookEndpoints(ctx)
		if err == nil {
			targets = append(targets, items...)
		}
	}

	for _, target := range targets {
		if !target.IsActive || strings.TrimSpace(target.URL) == "" {
			continue
		}
		go d.send(target, payload)
	}
}

func (d *Dispatcher) send(target models.WebhookEndpoint, payload []byte) {
	start := time.Now()
	req, err := http.NewRequest(http.MethodPost, target.URL, bytes.NewReader(payload))
	if err != nil {
		if d.logger != nil {
			d.logger.Error("webhook request build failed", slog.String("target", target.URL), slog.String("error", err.Error()))
		}
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Ndz-Event", "content.update")
	if strings.TrimSpace(target.Secret) != "" {
		req.Header.Set("X-Ndz-Signature", signPayload(payload, target.Secret))
	}

	resp, err := d.httpClient.Do(req)
	if err != nil {
		if d.logger != nil {
			d.logger.Error("webhook delivery failed", slog.String("target", target.URL), slog.Int64("duration_ms", time.Since(start).Milliseconds()), slog.String("error", err.Error()))
		}
		return
	}
	resp.Body.Close()
	if d.logger != nil {
		level := slog.LevelInfo
		message := "webhook delivered"
		if resp.StatusCode >= http.StatusMultipleChoices {
			level = slog.LevelError
			message = "webhook delivery rejected"
		}
		d.logger.Log(context.Background(), level, message,
			slog.String("target", target.URL),
			slog.Int("status", resp.StatusCode),
			slog.Int64("duration_ms", time.Since(start).Milliseconds()),
		)
	}
}

func signPayload(payload []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(payload)
	return fmt.Sprintf("sha256=%s", hex.EncodeToString(mac.Sum(nil)))
}
