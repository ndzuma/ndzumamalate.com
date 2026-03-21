package auth

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisStore struct {
	client *redis.Client
}

func NewRedisStore(redisURL string) (*RedisStore, error) {
	if strings.TrimSpace(redisURL) == "" {
		return nil, fmt.Errorf("REDIS_URL is required")
	}
	options, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(options)
	return &RedisStore{client: client}, nil
}

func (s *RedisStore) Close() error {
	return s.client.Close()
}

func (s *RedisStore) Ping(ctx context.Context) error {
	return s.client.Ping(ctx).Err()
}

func (s *RedisStore) SaveRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error {
	pipe := s.client.TxPipeline()
	key := refreshTokenKey(userID, tokenID)
	indexKey := refreshIndexKey(userID)
	pipe.Set(ctx, key, "1", ttl)
	pipe.SAdd(ctx, indexKey, tokenID)
	pipe.Expire(ctx, indexKey, ttl)
	_, err := pipe.Exec(ctx)
	return err
}

func (s *RedisStore) HasRefreshToken(ctx context.Context, userID, tokenID string) (bool, error) {
	count, err := s.client.Exists(ctx, refreshTokenKey(userID, tokenID)).Result()
	return count > 0, err
}

func (s *RedisStore) DeleteRefreshToken(ctx context.Context, userID, tokenID string) error {
	pipe := s.client.TxPipeline()
	pipe.Del(ctx, refreshTokenKey(userID, tokenID))
	pipe.SRem(ctx, refreshIndexKey(userID), tokenID)
	_, err := pipe.Exec(ctx)
	return err
}

func (s *RedisStore) DeleteUserRefreshTokens(ctx context.Context, userID string) error {
	indexKey := refreshIndexKey(userID)
	tokenIDs, err := s.client.SMembers(ctx, indexKey).Result()
	if err != nil && err != redis.Nil {
		return err
	}

	pipe := s.client.TxPipeline()
	for _, tokenID := range tokenIDs {
		pipe.Del(ctx, refreshTokenKey(userID, tokenID))
	}
	pipe.Del(ctx, indexKey)
	_, err = pipe.Exec(ctx)
	return err
}

func (s *RedisStore) AllowLoginAttempt(ctx context.Context, identifier string, limit int, window time.Duration) (bool, error) {
	return s.AllowAction(ctx, "login", identifier, limit, window)
}

func (s *RedisStore) AllowAction(ctx context.Context, action, identifier string, limit int, window time.Duration) (bool, error) {
	key := fmt.Sprintf("rate-limit:%s:%s", action, identifier)
	count, err := s.client.Incr(ctx, key).Result()
	if err != nil {
		return false, err
	}
	if count == 1 {
		if err := s.client.Expire(ctx, key, window).Err(); err != nil {
			return false, err
		}
	}
	return count <= int64(limit), nil
}

func refreshTokenKey(userID, tokenID string) string {
	return fmt.Sprintf("refresh:%s:%s", userID, tokenID)
}

func refreshIndexKey(userID string) string {
	return fmt.Sprintf("refresh-index:%s", userID)
}

func loginRateLimitKey(identifier string) string {
	return fmt.Sprintf("login-rate:%s", identifier)
}
