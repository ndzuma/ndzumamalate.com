package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"ndzumamalate.com/apps/api/internal/auth"
	"ndzumamalate.com/apps/api/internal/logging"
	"ndzumamalate.com/apps/api/internal/models"
	"ndzumamalate.com/apps/api/internal/realtime"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type API struct {
	store           Store
	authService     *auth.Service
	broker          *realtime.Broker
	webhookDispatch WebhookDispatcher
	resendClient    ContactSender
	rateLimitMax    int
	rateLimitWindow time.Duration
	allowedOrigins  []string
	logger          *slog.Logger
}

type Store interface {
	CreateLoginEvent(context.Context, string, string, string) (*models.LoginEvent, error)
	DeactivateLoginEvents(context.Context, string) error
	DeactivateSession(context.Context, string) error
	UpdateLoginEventsLastSeen(context.Context, string) error
	UpdateSessionLastSeen(context.Context, string) error
	GetSessionLastSeen(context.Context, string) (time.Time, bool, error)
	CleanupExpiredLoginEvents(context.Context, time.Time) error
	GetLatestLoginEvent(context.Context, string) (*models.LoginEvent, error)
	GetRecentLoginEvents(context.Context, string, int) ([]models.LoginEvent, error)
	Ping(context.Context) error
	BootstrapAdmin(context.Context, string, string) (*models.AdminUser, bool, error)
	GetAdminByEmail(context.Context, string) (*models.AdminUser, error)
	GetAdminByID(context.Context, string) (*models.AdminUser, error)
	UpdateAdminPassword(context.Context, string, string) error
	UpdateAdminLastLogin(context.Context, string, time.Time) error
	ListTags(context.Context) ([]models.Tag, error)
	CreateTag(context.Context, models.TagInput) (*models.Tag, error)
	UpdateTag(context.Context, string, models.TagInput) (*models.Tag, error)
	DeleteTag(context.Context, string) error
	ListProjects(context.Context, bool) ([]models.Project, error)
	GetProjectBySlug(context.Context, string, bool) (*models.Project, error)
	CreateProject(context.Context, models.ProjectInput) (*models.Project, error)
	UpdateProject(context.Context, string, models.ProjectInput) (*models.Project, error)
	DeleteProject(context.Context, string) error
	SwapProjectOrder(context.Context, string, int) error
	ListBlogs(context.Context, bool) ([]models.Blog, error)
	GetBlogBySlug(context.Context, string, bool) (*models.Blog, error)
	CreateBlog(context.Context, models.BlogInput) (*models.Blog, error)
	UpdateBlog(context.Context, string, models.BlogInput) (*models.Blog, error)
	DeleteBlog(context.Context, string) error
	ListSkills(context.Context) ([]models.Skill, error)
	CreateSkill(context.Context, models.SkillInput) (*models.Skill, error)
	UpdateSkill(context.Context, string, models.SkillInput) (*models.Skill, error)
	DeleteSkill(context.Context, string) error
	ListExperience(context.Context) ([]models.Experience, error)
	CreateExperience(context.Context, models.ExperienceInput) (*models.Experience, error)
	UpdateExperience(context.Context, string, models.ExperienceInput) (*models.Experience, error)
	DeleteExperience(context.Context, string) error
	ListCVs(context.Context) ([]models.CV, error)
	GetActiveCV(context.Context) (*models.CV, error)
	CreateCV(context.Context, models.CVInput) (*models.CV, error)
	UpdateCV(context.Context, string, models.CVInput) (*models.CV, error)
	DeleteCV(context.Context, string) error
	GetProfile(context.Context) (*models.Profile, error)
	UpsertProfile(context.Context, models.ProfileInput) (*models.Profile, error)
	ListWebhookEndpoints(context.Context) ([]models.WebhookEndpoint, error)
	ListActiveWebhookEndpoints(context.Context) ([]models.WebhookEndpoint, error)
	CreateWebhookEndpoint(context.Context, models.WebhookEndpointInput) (*models.WebhookEndpoint, error)
	UpdateWebhookEndpoint(context.Context, string, models.WebhookEndpointInput) (*models.WebhookEndpoint, error)
	DeleteWebhookEndpoint(context.Context, string) error
}

type WebhookDispatcher interface {
	Dispatch(context.Context, models.Event)
}

type ContactSender interface {
	SendContact(context.Context, models.ContactMessage) error
}

func NewAPI(store Store, authService *auth.Service, broker *realtime.Broker, webhookDispatch WebhookDispatcher, resendClient ContactSender, rateLimitMax int, rateLimitWindow time.Duration, allowedOrigins []string, logger *slog.Logger) *API {
	return &API{
		store:           store,
		authService:     authService,
		broker:          broker,
		webhookDispatch: webhookDispatch,
		resendClient:    resendClient,
		rateLimitMax:    rateLimitMax,
		rateLimitWindow: rateLimitWindow,
		allowedOrigins:  allowedOrigins,
		logger:          logger,
	}
}

func (a *API) Register(e *echo.Echo) {
	e.HideBanner = true
	e.HidePort = true
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(logging.RequestLogger(a.logger))

	if len(a.allowedOrigins) > 0 {
		e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins:     a.allowedOrigins,
			AllowCredentials: true,
		}))
	} else {
		e.Use(middleware.CORS())
	}

	e.GET("/health", a.health)

	v1 := e.Group("/api/v1")
	public := v1.Group("/public")
	public.GET("/projects", a.listPublishedProjects)
	public.GET("/projects/:slug", a.getPublishedProject)
	public.GET("/blogs", a.listPublishedBlogs)
	public.GET("/blogs/:slug", a.getPublishedBlog)
	public.GET("/skills", a.listSkills)
	public.GET("/experience", a.listExperience)
	public.GET("/profile", a.getProfile)
	public.GET("/tags", a.listTags)
	public.GET("/cv/active", a.getActiveCV)
	public.POST("/contact", a.sendContact)
	public.GET("/events", a.streamEvents)

	authGroup := v1.Group("/auth")
	authGroup.POST("/login", a.login)
	authGroup.POST("/refresh", a.refresh)
	authGroup.POST("/logout", a.logout)
	authGroup.POST("/ping", a.ping, a.requireAuth)
	authGroup.GET("/me", a.me, a.requireAuth)
	authGroup.GET("/activity", a.activity, a.requireAuth)
	authGroup.POST("/change-password", a.changePassword, a.requireAuth)

	admin := v1.Group("/admin", a.requireAuth)
	admin.GET("/tags", a.listTags)
	admin.POST("/tags", a.createTag)
	admin.PUT("/tags/:id", a.updateTag)
	admin.DELETE("/tags/:id", a.deleteTag)

	admin.GET("/projects", a.listProjects)
	admin.POST("/projects", a.createProject)
	admin.POST("/projects/:id/reorder", a.reorderProject)
	admin.PUT("/projects/:id", a.updateProject)
	admin.DELETE("/projects/:id", a.deleteProject)

	admin.GET("/blogs", a.listBlogs)
	admin.POST("/blogs", a.createBlog)
	admin.PUT("/blogs/:id", a.updateBlog)
	admin.DELETE("/blogs/:id", a.deleteBlog)

	admin.GET("/skills", a.listSkills)
	admin.POST("/skills", a.createSkill)
	admin.PUT("/skills/:id", a.updateSkill)
	admin.DELETE("/skills/:id", a.deleteSkill)

	admin.GET("/experience", a.listExperience)
	admin.POST("/experience", a.createExperience)
	admin.PUT("/experience/:id", a.updateExperience)
	admin.DELETE("/experience/:id", a.deleteExperience)

	admin.GET("/cv", a.listCVs)
	admin.POST("/cv", a.createCV)
	admin.PUT("/cv/:id", a.updateCV)
	admin.DELETE("/cv/:id", a.deleteCV)

	admin.GET("/profile", a.getProfile)
	admin.PUT("/profile", a.upsertProfile)

	admin.POST("/upload", a.uploadFile)

	admin.GET("/webhooks", a.listWebhookEndpoints)
	admin.POST("/webhooks", a.createWebhookEndpoint)
	admin.PUT("/webhooks/:id", a.updateWebhookEndpoint)
	admin.DELETE("/webhooks/:id", a.deleteWebhookEndpoint)

}

func (a *API) health(c echo.Context) error {
	ctx := c.Request().Context()
	if err := a.store.Ping(ctx); err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"status": "database unavailable"})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) streamEvents(c echo.Context) error {
	allowed, err := a.authService.AllowAction(c.Request().Context(), "sse", c.RealIP(), 20, 10*time.Minute)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if !allowed {
		a.logger.Warn("sse rate limit exceeded", slog.String("ip", c.RealIP()))
		return echo.NewHTTPError(http.StatusTooManyRequests, "too many sse connections")
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 10*time.Minute)
	defer cancel()

	res := c.Response()
	res.Header().Set(echo.HeaderContentType, "text/event-stream")
	res.Header().Set(echo.HeaderCacheControl, "no-cache")
	res.Header().Set(echo.HeaderConnection, "keep-alive")

	_, events, unsubscribe := a.broker.Subscribe()
	defer unsubscribe()

	flush, ok := res.Writer.(http.Flusher)
	if !ok {
		return echo.NewHTTPError(http.StatusInternalServerError, "streaming unsupported")
	}

	_ = writeSSE(res, models.Event{Type: "stream.connected", OccurredAt: time.Now().UTC()})
	flush.Flush()

	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case event, ok := <-events:
			if !ok {
				return nil
			}
			if err := writeSSE(res, event); err != nil {
				return nil
			}
			flush.Flush()
		case <-ticker.C:
			if _, err := fmt.Fprint(res, ": keep-alive\n\n"); err != nil {
				return nil
			}
			flush.Flush()
		}
	}
}

func (a *API) sendContact(c echo.Context) error {
	var input models.ContactMessage
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Subject) == "" || strings.TrimSpace(input.Message) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "name, email, subject, and message are required")
	}

	if len(input.Name) > 100 || len(input.Email) > 255 || len(input.Subject) > 255 || len(input.Message) > 2000 {
		return echo.NewHTTPError(http.StatusBadRequest, "input exceeds maximum length limits")
	}

	globalAllowed, err := a.authService.AllowAction(c.Request().Context(), "contact_global", time.Now().UTC().Format("2006-01-02"), 100, 24*time.Hour)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if !globalAllowed {
		a.logger.Warn("global contact rate limit exceeded")
		return echo.NewHTTPError(http.StatusTooManyRequests, "Daily contact limit reached. Please email me at n.malate@pulsefolio.net")
	}

	allowed, err := a.authService.AllowAction(c.Request().Context(), "contact", c.RealIP(), 4, 24*time.Hour)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if !allowed {
		a.logger.Warn("contact rate limit exceeded", slog.String("ip", c.RealIP()))
		return echo.NewHTTPError(http.StatusTooManyRequests, "too many contact requests")
	}

	if err := a.resendClient.SendContact(c.Request().Context(), input); err != nil {
		a.logger.Error("contact submission failed", slog.String("email", input.Email), slog.String("error", err.Error()))
		return echo.NewHTTPError(http.StatusBadGateway, err.Error())
	}
	a.logger.Info("contact submission accepted", slog.String("email", input.Email))
	return c.JSON(http.StatusAccepted, map[string]string{"status": "accepted"})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (a *API) login(c echo.Context) error {
	var input loginRequest
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	identifier := strings.ToLower(strings.TrimSpace(input.Email))
	if identifier == "" || strings.TrimSpace(input.Password) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email and password are required")
	}

	allowed, err := a.authService.AllowLoginAttempt(c.Request().Context(), identifier+":"+c.RealIP(), a.rateLimitMax, a.rateLimitWindow)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if !allowed {
		a.logger.Warn("login rate limit exceeded", slog.String("email", identifier), slog.String("ip", c.RealIP()))
		return echo.NewHTTPError(http.StatusTooManyRequests, "too many login attempts")
	}

	user, err := a.store.GetAdminByEmail(c.Request().Context(), identifier)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if user == nil || auth.ComparePassword(user.PasswordHash, input.Password) != nil {
		a.logger.Warn("login failed", slog.String("email", identifier), slog.String("ip", c.RealIP()))
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid credentials")
	}

	_ = a.store.UpdateAdminLastLogin(c.Request().Context(), user.ID, time.Now().UTC())
	evt, err := a.store.CreateLoginEvent(c.Request().Context(), user.ID, c.RealIP(), c.Request().UserAgent())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	session, err := a.authService.IssueSession(c.Request().Context(), user.ID, user.Email, evt.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	a.logger.Info("login succeeded", slog.String("user_id", user.ID), slog.String("email", user.Email), slog.String("ip", c.RealIP()))

	c.SetCookie(a.authService.BuildAccessCookie(session.AccessToken, session.AccessExpiry))
	c.SetCookie(a.authService.BuildRefreshCookie(session.RefreshToken))

	return c.JSON(http.StatusOK, map[string]string{"email": user.Email})
}

func (a *API) refresh(c echo.Context) error {
	refreshCookie, err := c.Cookie(auth.RefreshCookieName)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "missing refresh token")
	}

	claims, err := a.authService.ParseToken(refreshCookie.Value, "refresh")
	if err == nil && claims.SessionID != "" {
		lastSeen, isActive, err := a.store.GetSessionLastSeen(c.Request().Context(), claims.SessionID)
		if err != nil || !isActive || time.Since(lastSeen) > 5*time.Minute {
			_ = a.store.DeactivateSession(c.Request().Context(), claims.SessionID)
			_ = a.authService.RevokeRefreshToken(c.Request().Context(), refreshCookie.Value)
			c.SetCookie(a.authService.ClearAccessCookie())
			c.SetCookie(a.authService.ClearRefreshCookie())
			return echo.NewHTTPError(http.StatusUnauthorized, "session expired due to inactivity")
		}
	}

	session, err := a.authService.RotateRefreshToken(c.Request().Context(), refreshCookie.Value)
	if err != nil {
		a.logger.Warn("refresh failed", slog.String("error", err.Error()))
		return echo.NewHTTPError(http.StatusUnauthorized, err.Error())
	}
	_ = a.store.UpdateSessionLastSeen(c.Request().Context(), session.SessionID)
	a.logger.Info("session refreshed", slog.String("user_id", session.UserID), slog.String("email", session.Email))

	c.SetCookie(a.authService.BuildAccessCookie(session.AccessToken, session.AccessExpiry))
	c.SetCookie(a.authService.BuildRefreshCookie(session.RefreshToken))

	return c.JSON(http.StatusOK, map[string]string{"status": "refreshed"})
}

func (a *API) logout(c echo.Context) error {
	if refreshCookie, err := c.Cookie(auth.RefreshCookieName); err == nil {
		claims, _ := a.authService.ParseToken(refreshCookie.Value, "refresh")
		if claims != nil && claims.SessionID != "" {
			_ = a.store.DeactivateSession(c.Request().Context(), claims.SessionID)
		} else if claims != nil {
			_ = a.store.DeactivateLoginEvents(c.Request().Context(), claims.Subject)
		}
		_ = a.authService.RevokeRefreshToken(c.Request().Context(), refreshCookie.Value)
	}
	a.logger.Info("logout completed")
	c.SetCookie(a.authService.ClearAccessCookie())
	c.SetCookie(a.authService.ClearRefreshCookie())
	return c.NoContent(http.StatusNoContent)
}

func (a *API) ping(c echo.Context) error {
	actor := getActor(c)
	if actor == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	err := a.store.UpdateSessionLastSeen(c.Request().Context(), actor.SessionID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) me(c echo.Context) error {
	actor := getActor(c)
	if actor == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}
	return c.JSON(http.StatusOK, actor)
}

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (a *API) changePassword(c echo.Context) error {
	actor := getActor(c)
	if actor == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	var input changePasswordRequest
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	user, err := a.store.GetAdminByID(c.Request().Context(), actor.UserID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if user == nil || auth.ComparePassword(user.PasswordHash, input.CurrentPassword) != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid current password")
	}

	hash, err := auth.HashPassword(input.NewPassword)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if err := a.store.UpdateAdminPassword(c.Request().Context(), actor.UserID, hash); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if err := a.authService.RevokeAllSessions(c.Request().Context(), actor.UserID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	_ = a.store.DeactivateLoginEvents(c.Request().Context(), actor.UserID)
	evt, err := a.store.CreateLoginEvent(c.Request().Context(), actor.UserID, c.RealIP(), c.Request().UserAgent())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create session")
	}

	session, err := a.authService.IssueSession(c.Request().Context(), actor.UserID, actor.Email, evt.ID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	c.SetCookie(a.authService.BuildAccessCookie(session.AccessToken, session.AccessExpiry))
	c.SetCookie(a.authService.BuildRefreshCookie(session.RefreshToken))
	a.logger.Info("password changed", slog.String("user_id", actor.UserID), slog.String("email", actor.Email))

	a.publishEvent(c, "auth.password_changed", "admin_users", "password_changed", actor.UserID, nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) requireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(auth.AccessCookieName)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "missing access token")
		}
		actor, err := a.authService.ParseActorFromAccessToken(cookie.Value)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid access token")
		}

		if actor.SessionID == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid session format, please log in again")
		}

		lastSeen, isActive, err := a.store.GetSessionLastSeen(c.Request().Context(), actor.SessionID)
		if err != nil || !isActive {
			return echo.NewHTTPError(http.StatusUnauthorized, "session inactive")
		}
		// 5-minute strict timeout for bank style
		if time.Since(lastSeen) > 5*time.Minute {
			return echo.NewHTTPError(http.StatusUnauthorized, "session expired due to inactivity")
		}

		c.Set("actor", actor)
		return next(c)
	}
}

func getActor(c echo.Context) *auth.Actor {
	value := c.Get("actor")
	actor, _ := value.(*auth.Actor)
	return actor
}

func (a *API) listPublishedProjects(c echo.Context) error {
	items, err := a.store.ListProjects(c.Request().Context(), true)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) getPublishedProject(c echo.Context) error {
	item, err := a.store.GetProjectBySlug(c.Request().Context(), c.Param("slug"), true)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "project not found")
	}
	return c.JSON(http.StatusOK, item)
}

func (a *API) listPublishedBlogs(c echo.Context) error {
	items, err := a.store.ListBlogs(c.Request().Context(), true)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) getPublishedBlog(c echo.Context) error {
	item, err := a.store.GetBlogBySlug(c.Request().Context(), c.Param("slug"), true)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "blog not found")
	}
	return c.JSON(http.StatusOK, item)
}

func (a *API) listProjects(c echo.Context) error {
	items, err := a.store.ListProjects(c.Request().Context(), false)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listBlogs(c echo.Context) error {
	items, err := a.store.ListBlogs(c.Request().Context(), false)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listSkills(c echo.Context) error {
	items, err := a.store.ListSkills(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listExperience(c echo.Context) error {
	items, err := a.store.ListExperience(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listCVs(c echo.Context) error {
	items, err := a.store.ListCVs(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listTags(c echo.Context) error {
	items, err := a.store.ListTags(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) listWebhookEndpoints(c echo.Context) error {
	items, err := a.store.ListWebhookEndpoints(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, items)
}

func (a *API) getActiveCV(c echo.Context) error {
	item, err := a.store.GetActiveCV(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "active cv not found")
	}
	return c.JSON(http.StatusOK, item)
}

func (a *API) getProfile(c echo.Context) error {
	item, err := a.store.GetProfile(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if item == nil {
		return c.JSON(http.StatusOK, map[string]any{})
	}
	return c.JSON(http.StatusOK, item)
}

func (a *API) createTag(c echo.Context) error {
	var input models.TagInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	item, err := a.store.CreateTag(c.Request().Context(), input)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	a.publishEvent(c, "tag.created", "tags", "created", item.ID, item)
	return c.JSON(http.StatusCreated, item)
}

func (a *API) updateTag(c echo.Context) error {
	var input models.TagInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	item, err := a.store.UpdateTag(c.Request().Context(), c.Param("id"), input)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "tag not found")
	}
	a.publishEvent(c, "tag.updated", "tags", "updated", item.ID, item)
	return c.JSON(http.StatusOK, item)
}

func (a *API) deleteTag(c echo.Context) error {
	if err := a.store.DeleteTag(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "tag.deleted", "tags", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) createProject(c echo.Context) error { return a.writeProject(c, true) }
func (a *API) updateProject(c echo.Context) error { return a.writeProject(c, false) }

func (a *API) writeProject(c echo.Context, create bool) error {
	var input models.ProjectInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.Project
	var err error
	if create {
		item, err = a.store.CreateProject(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateProject(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "project not found")
	}
	a.publishEvent(c, projectEventType(create), "projects", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteProject(c echo.Context) error {
	if err := a.store.DeleteProject(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "project.deleted", "projects", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) reorderProject(c echo.Context) error {
	var body struct {
		Direction int `json:"direction"`
	}
	if err := c.Bind(&body); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if body.Direction != 1 && body.Direction != -1 {
		return echo.NewHTTPError(http.StatusBadRequest, "direction must be 1 or -1")
	}
	if err := a.store.SwapProjectOrder(c.Request().Context(), c.Param("id"), body.Direction); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	a.publishEvent(c, "project.reordered", "projects", "reordered", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) createBlog(c echo.Context) error { return a.writeBlog(c, true) }
func (a *API) updateBlog(c echo.Context) error { return a.writeBlog(c, false) }

func (a *API) writeBlog(c echo.Context, create bool) error {
	var input models.BlogInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.Blog
	var err error
	if create {
		item, err = a.store.CreateBlog(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateBlog(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "blog not found")
	}
	a.publishEvent(c, blogEventType(create), "blogs", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteBlog(c echo.Context) error {
	if err := a.store.DeleteBlog(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "blog.deleted", "blogs", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) createSkill(c echo.Context) error { return a.writeSkill(c, true) }
func (a *API) updateSkill(c echo.Context) error { return a.writeSkill(c, false) }

func (a *API) writeSkill(c echo.Context, create bool) error {
	var input models.SkillInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.Skill
	var err error
	if create {
		item, err = a.store.CreateSkill(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateSkill(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "skill not found")
	}
	a.publishEvent(c, skillEventType(create), "skills", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteSkill(c echo.Context) error {
	if err := a.store.DeleteSkill(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "skill.deleted", "skills", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) createExperience(c echo.Context) error { return a.writeExperience(c, true) }
func (a *API) updateExperience(c echo.Context) error { return a.writeExperience(c, false) }

func (a *API) writeExperience(c echo.Context, create bool) error {
	var input models.ExperienceInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.Experience
	var err error
	if create {
		item, err = a.store.CreateExperience(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateExperience(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "experience not found")
	}
	a.publishEvent(c, experienceEventType(create), "experience", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteExperience(c echo.Context) error {
	if err := a.store.DeleteExperience(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "experience.deleted", "experience", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) createCV(c echo.Context) error { return a.writeCV(c, true) }
func (a *API) updateCV(c echo.Context) error { return a.writeCV(c, false) }

func (a *API) writeCV(c echo.Context, create bool) error {
	var input models.CVInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.CV
	var err error
	if create {
		item, err = a.store.CreateCV(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateCV(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "cv not found")
	}
	a.publishEvent(c, cvEventType(create), "cv", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteCV(c echo.Context) error {
	if err := a.store.DeleteCV(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "cv.deleted", "cv", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) upsertProfile(c echo.Context) error {
	var input models.ProfileInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	item, err := a.store.UpsertProfile(c.Request().Context(), input)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	a.publishEvent(c, "profile.updated", "profile", "updated", fmt.Sprintf("%d", item.ID), item)
	return c.JSON(http.StatusOK, item)
}

func (a *API) createWebhookEndpoint(c echo.Context) error { return a.writeWebhook(c, true) }
func (a *API) updateWebhookEndpoint(c echo.Context) error { return a.writeWebhook(c, false) }

func (a *API) writeWebhook(c echo.Context, create bool) error {
	var input models.WebhookEndpointInput
	if err := c.Bind(&input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	var item *models.WebhookEndpoint
	var err error
	if create {
		item, err = a.store.CreateWebhookEndpoint(c.Request().Context(), input)
	} else {
		item, err = a.store.UpdateWebhookEndpoint(c.Request().Context(), c.Param("id"), input)
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if item == nil {
		return echo.NewHTTPError(http.StatusNotFound, "webhook not found")
	}
	a.publishEvent(c, webhookEventType(create), "webhooks", actionName(create), item.ID, item)
	status := http.StatusOK
	if create {
		status = http.StatusCreated
	}
	return c.JSON(status, item)
}

func (a *API) deleteWebhookEndpoint(c echo.Context) error {
	if err := a.store.DeleteWebhookEndpoint(c.Request().Context(), c.Param("id")); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	a.publishEvent(c, "webhook.deleted", "webhooks", "deleted", c.Param("id"), nil)
	return c.NoContent(http.StatusNoContent)
}

func (a *API) publishEvent(c echo.Context, eventType, resource, action, resourceID string, payload interface{}) {
	event := models.Event{
		Type:       eventType,
		Resource:   resource,
		Action:     action,
		ResourceID: resourceID,
		OccurredAt: time.Now().UTC(),
		Payload:    payload,
	}
	a.broker.Publish(event)
	a.webhookDispatch.Dispatch(c.Request().Context(), event)
	a.logger.Info("domain event published", slog.String("type", event.Type), slog.String("resource", resource), slog.String("action", action), slog.String("resource_id", resourceID))
}

func writeSSE(res *echo.Response, event models.Event) error {
	body, err := json.Marshal(event)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(res, "event: %s\ndata: %s\n\n", event.Type, body)
	return err
}

func actionName(create bool) string {
	if create {
		return "created"
	}
	return "updated"
}

func projectEventType(create bool) string {
	if create {
		return "project.created"
	}
	return "project.updated"
}
func blogEventType(create bool) string {
	if create {
		return "blog.created"
	}
	return "blog.updated"
}
func skillEventType(create bool) string {
	if create {
		return "skill.created"
	}
	return "skill.updated"
}
func experienceEventType(create bool) string {
	if create {
		return "experience.created"
	}
	return "experience.updated"
}
func cvEventType(create bool) string {
	if create {
		return "cv.created"
	}
	return "cv.updated"
}
func webhookEventType(create bool) string {
	if create {
		return "webhook.created"
	}
	return "webhook.updated"
}

func (a *API) activity(c echo.Context) error {
	actor := getActor(c)
	if actor == nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")
	}

	threshold := time.Now().UTC().Add(-a.authService.RefreshTTL())
	if err := a.store.CleanupExpiredLoginEvents(c.Request().Context(), threshold); err != nil {
		a.logger.Warn("failed to cleanup expired login events", slog.String("error", err.Error()))
	}

	events, err := a.store.GetRecentLoginEvents(c.Request().Context(), actor.UserID, 5)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if len(events) == 0 {
		return c.JSON(http.StatusOK, []models.LoginEvent{})
	}
	return c.JSON(http.StatusOK, events)
}
