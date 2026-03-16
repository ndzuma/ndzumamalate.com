package notifications

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
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
}

func NewDispatcher(store WebhookSource, targets []string, sharedSecret string) *Dispatcher {
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
	req, err := http.NewRequest(http.MethodPost, target.URL, bytes.NewReader(payload))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Ndz-Event", "content.update")
	if strings.TrimSpace(target.Secret) != "" {
		req.Header.Set("X-Ndz-Signature", signPayload(payload, target.Secret))
	}

	resp, err := d.httpClient.Do(req)
	if err != nil {
		return
	}
	resp.Body.Close()
}

func signPayload(payload []byte, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(payload)
	return fmt.Sprintf("sha256=%s", hex.EncodeToString(mac.Sum(nil)))
}
