package realtime

import (
	"testing"
	"time"

	"ndzumamalate.com/apps/api/internal/models"
)

func TestBrokerPublishesEvents(t *testing.T) {
	broker := NewBroker()
	_, events, unsubscribe := broker.Subscribe()
	defer unsubscribe()

	expected := models.Event{Type: "project.updated", OccurredAt: time.Now().UTC()}
	broker.Publish(expected)

	select {
	case event := <-events:
		if event.Type != expected.Type {
			t.Fatalf("expected %q, got %q", expected.Type, event.Type)
		}
	case <-time.After(time.Second):
		t.Fatal("timed out waiting for event")
	}
}
