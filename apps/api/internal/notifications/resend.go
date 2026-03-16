package notifications

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"ndzumamalate.com/apps/api/internal/models"
)

type ResendClient struct {
	apiKey     string
	fromEmail  string
	toEmail    string
	httpClient *http.Client
	logger     *slog.Logger
}

func NewResendClient(apiKey, fromEmail, toEmail string, logger *slog.Logger) *ResendClient {
	return &ResendClient{
		apiKey:     apiKey,
		fromEmail:  fromEmail,
		toEmail:    toEmail,
		httpClient: &http.Client{Timeout: 10 * time.Second},
		logger:     logger,
	}
}

func (c *ResendClient) SendContact(ctx context.Context, message models.ContactMessage) error {
	start := time.Now()
	if strings.TrimSpace(c.apiKey) == "" {
		if c.logger != nil {
			c.logger.Info("contact email skipped", slog.String("reason", "missing_api_key"), slog.String("email", message.Email))
		}
		return nil
	}

	payload := map[string]string{
		"from":     c.fromEmail,
		"to":       c.toEmail,
		"subject":  fmt.Sprintf("Website contact: %s", message.Subject),
		"reply_to": message.Email,
		"text":     fmt.Sprintf("Name: %s\nEmail: %s\n\n%s", message.Name, message.Email, message.Message),
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		if c.logger != nil {
			c.logger.Error("contact email failed", slog.String("email", message.Email), slog.Int64("duration_ms", time.Since(start).Milliseconds()), slog.String("error", err.Error()))
		}
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusMultipleChoices {
		if c.logger != nil {
			c.logger.Error("contact email rejected", slog.String("email", message.Email), slog.Int("status", resp.StatusCode), slog.Int64("duration_ms", time.Since(start).Milliseconds()))
		}
		return fmt.Errorf("resend returned status %d", resp.StatusCode)
	}
	if c.logger != nil {
		c.logger.Info("contact email sent", slog.String("email", message.Email), slog.Int("status", resp.StatusCode), slog.Int64("duration_ms", time.Since(start).Milliseconds()))
	}
	return nil
}
