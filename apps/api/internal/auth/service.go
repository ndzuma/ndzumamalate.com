package auth

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	AccessCookieName  = "ndz_access_token"
	RefreshCookieName = "ndz_refresh_token"
	accessTokenType   = "access"
	refreshTokenType  = "refresh"
)

type TokenStore interface {
	SaveRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error
	HasRefreshToken(ctx context.Context, userID, tokenID string) (bool, error)
	DeleteRefreshToken(ctx context.Context, userID, tokenID string) error
	DeleteUserRefreshTokens(ctx context.Context, userID string) error
	AllowLoginAttempt(ctx context.Context, identifier string, limit int, window time.Duration) (bool, error)
	AllowAction(ctx context.Context, action, identifier string, limit int, window time.Duration) (bool, error)
}

type Service struct {
	issuer       string
	accessTTL    time.Duration
	refreshTTL   time.Duration
	privateKey   *rsa.PrivateKey
	publicKey    *rsa.PublicKey
	tokenStore   TokenStore
	cookieDomain string
	cookieSecure bool
}

type Claims struct {
	TokenType string `json:"token_type"`
	Email     string `json:"email"`
	SessionID string `json:"session_id"`
	jwt.RegisteredClaims
}

type Session struct {
	AccessToken  string
	RefreshToken string
	AccessExpiry time.Time
	UserID       string
	Email        string
	SessionID    string
}

type Actor struct {
	UserID    string
	Email     string
	SessionID string
}

func NewService(issuer string, accessTTL, refreshTTL time.Duration, privateKey *rsa.PrivateKey, tokenStore TokenStore, cookieDomain string, cookieSecure bool) *Service {
	return &Service{
		issuer:       issuer,
		accessTTL:    accessTTL,
		refreshTTL:   refreshTTL,
		privateKey:   privateKey,
		publicKey:    &privateKey.PublicKey,
		tokenStore:   tokenStore,
		cookieDomain: cookieDomain,
		cookieSecure: cookieSecure,
	}
}

func HashPassword(password string) (string, error) {
	if len(strings.TrimSpace(password)) < 8 {
		return "", fmt.Errorf("password must be at least 8 characters")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func ComparePassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

func (s *Service) RefreshTTL() time.Duration {
	return s.refreshTTL
}

func (s *Service) IssueSession(ctx context.Context, userID, email, sessionID string) (*Session, error) {
	now := time.Now().UTC()
	accessID, err := generateID()
	if err != nil {
		return nil, err
	}
	refreshID, err := generateID()
	if err != nil {
		return nil, err
	}

	accessExpiry := now.Add(s.accessTTL)
	refreshExpiry := now.Add(s.refreshTTL)

	accessToken, err := s.signToken(Claims{
		TokenType: accessTokenType,
		Email:     email,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(accessExpiry),
			ID:        accessID,
		},
	})
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.signToken(Claims{
		TokenType: refreshTokenType,
		Email:     email,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(refreshExpiry),
			ID:        refreshID,
		},
	})
	if err != nil {
		return nil, err
	}

	if err := s.tokenStore.SaveRefreshToken(ctx, userID, refreshID, s.refreshTTL); err != nil {
		return nil, err
	}

	return &Session{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		AccessExpiry: accessExpiry,
		UserID:       userID,
		Email:        email,
		SessionID:    sessionID,
	}, nil
}

func (s *Service) RotateRefreshToken(ctx context.Context, refreshToken string) (*Session, error) {
	claims, err := s.ParseToken(refreshToken, refreshTokenType)
	if err != nil {
		return nil, err
	}

	active, err := s.tokenStore.HasRefreshToken(ctx, claims.Subject, claims.ID)
	if err != nil {
		return nil, err
	}
	if !active {
		return nil, fmt.Errorf("refresh token is no longer active")
	}

	if err := s.tokenStore.DeleteRefreshToken(ctx, claims.Subject, claims.ID); err != nil {
		return nil, err
	}

	return s.IssueSession(ctx, claims.Subject, claims.Email, claims.SessionID)
}

func (s *Service) RevokeRefreshToken(ctx context.Context, refreshToken string) error {
	claims, err := s.ParseToken(refreshToken, refreshTokenType)
	if err != nil {
		return err
	}
	return s.tokenStore.DeleteRefreshToken(ctx, claims.Subject, claims.ID)
}

func (s *Service) RevokeAllSessions(ctx context.Context, userID string) error {
	return s.tokenStore.DeleteUserRefreshTokens(ctx, userID)
}

func (s *Service) ParseToken(token, expectedType string) (*Claims, error) {
	parsed, err := jwt.ParseWithClaims(token, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != jwt.SigningMethodRS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.publicKey, nil
	}, jwt.WithIssuer(s.issuer))
	if err != nil {
		return nil, err
	}

	claims, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	if claims.TokenType != expectedType {
		return nil, fmt.Errorf("invalid token type")
	}
	return claims, nil
}

func (s *Service) BuildAccessCookie(token string, expiresAt time.Time) *http.Cookie {
	return s.buildCookie(AccessCookieName, token, expiresAt)
}

func (s *Service) BuildRefreshCookie(token string) *http.Cookie {
	return s.buildCookie(RefreshCookieName, token, time.Now().UTC().Add(s.refreshTTL))
}

func (s *Service) ClearAccessCookie() *http.Cookie {
	return s.clearCookie(AccessCookieName)
}

func (s *Service) ClearRefreshCookie() *http.Cookie {
	return s.clearCookie(RefreshCookieName)
}

func (s *Service) AllowLoginAttempt(ctx context.Context, identifier string, limit int, window time.Duration) (bool, error) {
	return s.tokenStore.AllowLoginAttempt(ctx, identifier, limit, window)
}

func (s *Service) AllowAction(ctx context.Context, action, identifier string, limit int, window time.Duration) (bool, error) {
	return s.tokenStore.AllowAction(ctx, action, identifier, limit, window)
}

func (s *Service) ParseActorFromAccessToken(token string) (*Actor, error) {
	claims, err := s.ParseToken(token, accessTokenType)
	if err != nil {
		return nil, err
	}
	return &Actor{UserID: claims.Subject, Email: claims.Email, SessionID: claims.SessionID}, nil
}

func (s *Service) signToken(claims Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(s.privateKey)
}

func (s *Service) buildCookie(name, value string, expiresAt time.Time) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		Domain:   s.cookieDomain,
		HttpOnly: true,
		Secure:   s.cookieSecure,
		SameSite: http.SameSiteStrictMode,
		Expires:  expiresAt,
		MaxAge:   int(time.Until(expiresAt).Seconds()),
	}
}

func (s *Service) clearCookie(name string) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		Domain:   s.cookieDomain,
		HttpOnly: true,
		Secure:   s.cookieSecure,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	}
}
