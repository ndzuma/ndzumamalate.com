package handlers

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"ndzumamalate.com/apps/api/internal/auth"
	"ndzumamalate.com/apps/api/internal/models"
	"ndzumamalate.com/apps/api/internal/realtime"

	"github.com/labstack/echo/v4"
)

type stubStore struct{}

func (s *stubStore) Ping(context.Context) error { return nil }
func (s *stubStore) BootstrapAdmin(context.Context, string, string) (*models.AdminUser, bool, error) {
	return &models.AdminUser{ID: "admin-1", Email: "admin@example.com"}, true, nil
}
func (s *stubStore) GetAdminByEmail(context.Context, string) (*models.AdminUser, error) {
	hash, _ := auth.HashPassword("secret123")
	return &models.AdminUser{ID: "admin-1", Email: "admin@example.com", PasswordHash: hash}, nil
}
func (s *stubStore) GetAdminByID(context.Context, string) (*models.AdminUser, error) {
	hash, _ := auth.HashPassword("secret123")
	return &models.AdminUser{ID: "admin-1", Email: "admin@example.com", PasswordHash: hash}, nil
}
func (s *stubStore) UpdateAdminPassword(context.Context, string, string) error     { return nil }
func (s *stubStore) UpdateAdminLastLogin(context.Context, string, time.Time) error { return nil }
func (s *stubStore) ListProjects(context.Context, bool) ([]models.Project, error) {
	return []models.Project{}, nil
}
func (s *stubStore) GetProjectBySlug(context.Context, string, bool) (*models.Project, error) {
	return &models.Project{ID: "project-1", Slug: "demo"}, nil
}
func (s *stubStore) ListBlogs(context.Context, bool) ([]models.Blog, error) {
	return []models.Blog{}, nil
}
func (s *stubStore) GetBlogBySlug(context.Context, string, bool) (*models.Blog, error) {
	return &models.Blog{ID: "blog-1", Slug: "demo"}, nil
}
func (s *stubStore) ListSkills(context.Context) ([]models.Skill, error) { return []models.Skill{}, nil }
func (s *stubStore) ListExperience(context.Context) ([]models.Experience, error) {
	return []models.Experience{}, nil
}
func (s *stubStore) GetProfile(context.Context) (*models.Profile, error) {
	return &models.Profile{ID: 1}, nil
}
func (s *stubStore) GetActiveCV(context.Context) (*models.CV, error) {
	return &models.CV{ID: "cv-1"}, nil
}
func (s *stubStore) ListTags(context.Context) ([]models.Tag, error) { return []models.Tag{}, nil }
func (s *stubStore) CreateTag(context.Context, models.TagInput) (*models.Tag, error) {
	return &models.Tag{ID: "tag-1"}, nil
}
func (s *stubStore) UpdateTag(context.Context, string, models.TagInput) (*models.Tag, error) {
	return &models.Tag{ID: "tag-1"}, nil
}
func (s *stubStore) DeleteTag(context.Context, string) error { return nil }
func (s *stubStore) CreateProject(context.Context, models.ProjectInput) (*models.Project, error) {
	return &models.Project{ID: "project-1"}, nil
}
func (s *stubStore) UpdateProject(context.Context, string, models.ProjectInput) (*models.Project, error) {
	return &models.Project{ID: "project-1"}, nil
}
func (s *stubStore) DeleteProject(context.Context, string) error { return nil }
func (s *stubStore) CreateBlog(context.Context, models.BlogInput) (*models.Blog, error) {
	return &models.Blog{ID: "blog-1"}, nil
}
func (s *stubStore) UpdateBlog(context.Context, string, models.BlogInput) (*models.Blog, error) {
	return &models.Blog{ID: "blog-1"}, nil
}
func (s *stubStore) DeleteBlog(context.Context, string) error { return nil }
func (s *stubStore) CreateSkill(context.Context, models.SkillInput) (*models.Skill, error) {
	return &models.Skill{ID: "skill-1"}, nil
}
func (s *stubStore) UpdateSkill(context.Context, string, models.SkillInput) (*models.Skill, error) {
	return &models.Skill{ID: "skill-1"}, nil
}
func (s *stubStore) DeleteSkill(context.Context, string) error { return nil }
func (s *stubStore) CreateExperience(context.Context, models.ExperienceInput) (*models.Experience, error) {
	return &models.Experience{ID: "exp-1"}, nil
}
func (s *stubStore) UpdateExperience(context.Context, string, models.ExperienceInput) (*models.Experience, error) {
	return &models.Experience{ID: "exp-1"}, nil
}
func (s *stubStore) DeleteExperience(context.Context, string) error { return nil }
func (s *stubStore) ListCVs(context.Context) ([]models.CV, error)   { return []models.CV{}, nil }
func (s *stubStore) CreateCV(context.Context, models.CVInput) (*models.CV, error) {
	return &models.CV{ID: "cv-1"}, nil
}
func (s *stubStore) UpdateCV(context.Context, string, models.CVInput) (*models.CV, error) {
	return &models.CV{ID: "cv-1"}, nil
}
func (s *stubStore) DeleteCV(context.Context, string) error { return nil }
func (s *stubStore) UpsertProfile(context.Context, models.ProfileInput) (*models.Profile, error) {
	return &models.Profile{ID: 1}, nil
}
func (s *stubStore) ListWebhookEndpoints(context.Context) ([]models.WebhookEndpoint, error) {
	return []models.WebhookEndpoint{}, nil
}
func (s *stubStore) ListActiveWebhookEndpoints(context.Context) ([]models.WebhookEndpoint, error) {
	return []models.WebhookEndpoint{}, nil
}
func (s *stubStore) CreateWebhookEndpoint(context.Context, models.WebhookEndpointInput) (*models.WebhookEndpoint, error) {
	return &models.WebhookEndpoint{ID: "wh-1"}, nil
}
func (s *stubStore) UpdateWebhookEndpoint(context.Context, string, models.WebhookEndpointInput) (*models.WebhookEndpoint, error) {
	return &models.WebhookEndpoint{ID: "wh-1"}, nil
}
func (s *stubStore) DeleteWebhookEndpoint(context.Context, string) error { return nil }
func (s *stubStore) SwapProjectOrder(context.Context, string, int) error { return nil }

type noopResend struct{}

func (n *noopResend) SendContact(context.Context, models.ContactMessage) error { return nil }

type noopDispatcher struct{}

func (n *noopDispatcher) Dispatch(context.Context, models.Event) {}

type memoryTokens struct{}

func (m *memoryTokens) SaveRefreshToken(context.Context, string, string, time.Duration) error {
	return nil
}
func (m *memoryTokens) HasRefreshToken(context.Context, string, string) (bool, error) {
	return true, nil
}
func (m *memoryTokens) DeleteRefreshToken(context.Context, string, string) error { return nil }
func (m *memoryTokens) DeleteUserRefreshTokens(context.Context, string) error    { return nil }
func (m *memoryTokens) AllowLoginAttempt(context.Context, string, int, time.Duration) (bool, error) {
	return true, nil
}

func TestLoginSetsCookies(t *testing.T) {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("GenerateKey returned error: %v", err)
	}

	api := NewAPI(
		&stubStore{},
		auth.NewService("issuer", time.Minute, time.Hour, privateKey, &memoryTokens{}, "", false),
		realtime.NewBroker(),
		&noopDispatcher{},
		&noopResend{},
		5,
		time.Minute,
		slog.Default(),
	)

	e := echo.New()
	api.Register(e)

	body, _ := json.Marshal(map[string]string{"email": "admin@example.com", "password": "secret123"})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if len(rec.Result().Cookies()) < 2 {
		t.Fatalf("expected auth cookies to be set, got %d", len(rec.Result().Cookies()))
	}
}
