package notifications

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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
}

func NewResendClient(apiKey, fromEmail, toEmail string) *ResendClient {
	return &ResendClient{
		apiKey:     apiKey,
		fromEmail:  fromEmail,
		toEmail:    toEmail,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *ResendClient) SendContact(ctx context.Context, message models.ContactMessage) error {
	if strings.TrimSpace(c.apiKey) == "" {
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
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("resend returned status %d", resp.StatusCode)
	}
	return nil
}
