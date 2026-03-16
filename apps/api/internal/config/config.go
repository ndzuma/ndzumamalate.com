package config

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv           string
	Port             string
	DatabaseURL      string
	RedisURL         string
	ResendAPIKey     string
	ContactFromEmail string
	ContactToEmail   string
	JWTIssuer        string
	AccessTTL        time.Duration
	RefreshTTL       time.Duration
	CookieDomain     string
	CookieSecure     bool
	WebhookTargets   []string
	WebhookSecret    string
	RateLimitMax     int
	RateLimitWindow  time.Duration
	PrivateKey       *rsa.PrivateKey
	PublicKeyPEM     string
}

func Load() (Config, error) {
	loadEnvFiles()

	privateKey, publicKeyPEM, err := loadKeys()
	if err != nil {
		return Config{}, err
	}

	return Config{
		AppEnv:           getEnv("APP_ENV", "development"),
		Port:             getEnv("API_PORT", "8080"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		RedisURL:         os.Getenv("REDIS_URL"),
		ResendAPIKey:     os.Getenv("RESEND_API_KEY"),
		ContactFromEmail: getEnv("CONTACT_FROM_EMAIL", "ndzumamalate.com@pulsefolio.net"),
		ContactToEmail:   getEnv("CONTACT_TO_EMAIL", "n.malate@oulsefolio.net"),
		JWTIssuer:        getEnv("JWT_ISSUER", "ndzumamalate-api"),
		AccessTTL:        getDurationEnv("JWT_ACCESS_TTL", 15*time.Minute),
		RefreshTTL:       getDurationEnv("JWT_REFRESH_TTL", 7*24*time.Hour),
		CookieDomain:     os.Getenv("COOKIE_DOMAIN"),
		CookieSecure:     getBoolEnv("COOKIE_SECURE", false),
		WebhookTargets:   splitCSV(os.Getenv("WEBHOOK_TARGETS")),
		WebhookSecret:    os.Getenv("WEBHOOK_SECRET"),
		RateLimitMax:     getIntEnv("LOGIN_RATE_LIMIT_MAX", 5),
		RateLimitWindow:  getDurationEnv("LOGIN_RATE_LIMIT_WINDOW", 15*time.Minute),
		PrivateKey:       privateKey,
		PublicKeyPEM:     publicKeyPEM,
	}, nil
}

func loadEnvFiles() {
	wd, err := os.Getwd()
	if err != nil {
		_ = godotenv.Load(".env.local")
		return
	}

	paths := []string{
		filepath.Join(wd, ".env.local"),
		filepath.Join(wd, "..", ".env.local"),
		filepath.Join(wd, "..", "..", ".env.local"),
		filepath.Join(wd, "..", "..", "..", ".env.local"),
	}

	_ = godotenv.Load(paths...)
}

func loadKeys() (*rsa.PrivateKey, string, error) {
	privateKeyPEM := strings.TrimSpace(os.Getenv("JWT_PRIVATE_KEY"))
	privateKeyPEM = strings.ReplaceAll(privateKeyPEM, "\\n", "\n")
	if privateKeyPEM == "" {
		privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			return nil, "", fmt.Errorf("generate rsa key: %w", err)
		}

		publicKeyPEM, err := derivePublicPEM(privateKey)
		if err != nil {
			return nil, "", err
		}

		return privateKey, publicKeyPEM, nil
	}

	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		return nil, "", fmt.Errorf("invalid JWT_PRIVATE_KEY pem")
	}

	if key, err := x509.ParsePKCS1PrivateKey(block.Bytes); err == nil {
		publicKeyPEM, pubErr := derivePublicPEM(key)
		if pubErr != nil {
			return nil, "", pubErr
		}
		return key, publicKeyPEM, nil
	}

	parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, "", fmt.Errorf("parse JWT_PRIVATE_KEY: %w", err)
	}

	privateKey, ok := parsedKey.(*rsa.PrivateKey)
	if !ok {
		return nil, "", fmt.Errorf("JWT_PRIVATE_KEY is not an rsa private key")
	}

	publicKeyPEM, err := derivePublicPEM(privateKey)
	if err != nil {
		return nil, "", err
	}

	return privateKey, publicKeyPEM, nil
}

func derivePublicPEM(privateKey *rsa.PrivateKey) (string, error) {
	publicDER, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return "", fmt.Errorf("marshal public key: %w", err)
	}

	return string(pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: publicDER})), nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getIntEnv(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getBoolEnv(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func splitCSV(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}

	parts := strings.Split(value, ",")
	cleaned := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			cleaned = append(cleaned, trimmed)
		}
	}

	return cleaned
}
