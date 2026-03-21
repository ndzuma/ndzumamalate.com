package auth

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"testing"
	"time"
)

type memoryTokenStore struct {
	tokens map[string]map[string]bool
	hits   map[string]int
}

func newMemoryTokenStore() *memoryTokenStore {
	return &memoryTokenStore{
		tokens: map[string]map[string]bool{},
		hits:   map[string]int{},
	}
}

func (m *memoryTokenStore) SaveRefreshToken(_ context.Context, userID, tokenID string, _ time.Duration) error {
	if _, ok := m.tokens[userID]; !ok {
		m.tokens[userID] = map[string]bool{}
	}
	m.tokens[userID][tokenID] = true
	return nil
}

func (m *memoryTokenStore) HasRefreshToken(_ context.Context, userID, tokenID string) (bool, error) {
	return m.tokens[userID][tokenID], nil
}

func (m *memoryTokenStore) DeleteRefreshToken(_ context.Context, userID, tokenID string) error {
	delete(m.tokens[userID], tokenID)
	return nil
}

func (m *memoryTokenStore) DeleteUserRefreshTokens(_ context.Context, userID string) error {
	delete(m.tokens, userID)
	return nil
}

func (m *memoryTokenStore) AllowAction(_ context.Context, action, identifier string, limit int, _ time.Duration) (bool, error) {
	key := action + ":" + identifier
	m.hits[key]++
	return m.hits[key] <= limit, nil
}

func (m *memoryTokenStore) AllowLoginAttempt(_ context.Context, identifier string, limit int, _ time.Duration) (bool, error) {
	m.hits[identifier]++
	return m.hits[identifier] <= limit, nil
}

func TestPasswordHashAndCompare(t *testing.T) {
	hash, err := HashPassword("correct horse battery staple")
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}

	if err := ComparePassword(hash, "correct horse battery staple"); err != nil {
		t.Fatalf("ComparePassword returned error: %v", err)
	}

	if err := ComparePassword(hash, "wrong password"); err == nil {
		t.Fatal("expected wrong password comparison to fail")
	}
}

func TestIssueAndRotateSession(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("GenerateKey returned error: %v", err)
	}

	store := newMemoryTokenStore()
	service := NewService("issuer", 15*time.Minute, 24*time.Hour, privateKey, store, "", false)

	session, err := service.IssueSession(context.Background(), "user-1", "test@example.com", "sess-1")
	if err != nil {
		t.Fatalf("IssueSession returned error: %v", err)
	}

	actor, err := service.ParseActorFromAccessToken(session.AccessToken)
	if err != nil {
		t.Fatalf("ParseActorFromAccessToken returned error: %v", err)
	}
	if actor.UserID != "user-1" || actor.Email != "test@example.com" {
		t.Fatalf("unexpected actor: %#v", actor)
	}

	rotated, err := service.RotateRefreshToken(context.Background(), session.RefreshToken)
	if err != nil {
		t.Fatalf("RotateRefreshToken returned error: %v", err)
	}
	if rotated.RefreshToken == session.RefreshToken {
		t.Fatal("expected rotated refresh token to change")
	}

	if _, err := service.RotateRefreshToken(context.Background(), session.RefreshToken); err == nil {
		t.Fatal("expected old refresh token rotation to fail")
	}
}

func TestAllowLoginAttempt(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("GenerateKey returned error: %v", err)
	}

	service := NewService("issuer", time.Minute, time.Hour, privateKey, newMemoryTokenStore(), "", false)
	allowed, err := service.AllowLoginAttempt(context.Background(), "127.0.0.1", 1, time.Minute)
	if err != nil || !allowed {
		t.Fatalf("first login attempt should pass, allowed=%v err=%v", allowed, err)
	}
	allowed, err = service.AllowLoginAttempt(context.Background(), "127.0.0.1", 1, time.Minute)
	if err != nil {
		t.Fatalf("second login attempt returned error: %v", err)
	}
	if allowed {
		t.Fatal("second login attempt should be blocked")
	}
}
