.PHONY: build-cms build test

build-cms:
	cd ../cms && bun install
	cd ../cms && bun run build
	cd ../cms && bun run sync:api

build: build-cms
	go build -o bin/server ./cmd/server

test: build-cms
	go test ./...
