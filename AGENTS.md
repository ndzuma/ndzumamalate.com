# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

Turborepo monorepo for a personal website with three apps:

- **apps/web** -- Next.js 16 (App Router, React 19) public website (barely scaffolded)
- **apps/cms** -- Svelte 5 SPA admin panel (Vite 8, hash-based routing)
- **apps/api** -- Go 1.23 REST API (Echo v4, pgx v5, Redis)

Package manager: **Bun** (`bun@1.3.10`). No npm/yarn/pnpm.

### Monorepo (from repo root)

```sh
bun install              # install all workspace dependencies
bun run dev              # start all apps in parallel (web, cms, api)
bun run build            # build web + cms via Turborepo
```

## Tasks per change

- chech if the changes affect how github workflows work, if so update the
- Make sure that if we can test the whatever we are making. we do so
- Make sure after every change if we need to change the repository structure, we update the AGENTS.md file to reflect the changes
- Make the tests first, make sure they fail, then write the code, and then make sure they pass

## Repository Structure

```
apps/
  api/
    cmd/server/main.go          # entrypoint, graceful shutdown
    cmd/migrate/                 # migration runner
    cmd/user/                    # admin user CLI
    internal/
      auth/                     # JWT (RS256), bcrypt, Redis token store
      config/                   # env loading via godotenv
      db/                       # pgx pool, Store struct with all SQL
      handlers/                 # Echo handlers, Store interface, route registration
      logging/                  # slog JSON logger
      models/                   # all domain structs + Input types
      notifications/            # webhook dispatcher, Resend email client
      realtime/                 # SSE broker
    migrations/                 # sequential SQL files (001_, 002_, ...)
  cms/
    src/
      pages/                    # page components (Dashboard, Editor, forms)
      components/               # shared UI (TopBar, BottomNav, Toast)
      lib/                      # api.js, router.svelte.js, auth.svelte.js, toast.svelte.js
      styles/global.css
  web/
    app/                        # Next.js App Router (layout.js, page.js)
    components/                 # React components
    public/                     # static assets
```

## Code Style -- CMS / Svelte (apps/cms)

### Imports

- Relative imports within src (`'../lib/api.js'`, `'../components/TopBar.svelte'`)
- Icons from `phosphor-svelte` (named imports)
- Font via `@fontsource-variable/geist`

## Code Style -- Web / Next.js (apps/web)

### Framework

- Next.js 16 with App Router, React 19
- TypeScript
- Font: Geist Sans. Icons: Phosphor Icons. Animations: Motion (React Motion)

## Key Architecture Decisions

- CMS is embedded into the Go binary via `go:embed` (build CMS, then `sync:api`)
- Auth is fully native Go: RS256 JWTs in HTTP-only cookies, refresh rotation in Redis
- DB migrations are sequential SQL files applied at server startup
- Project sort order is 0-based contiguous; delete recompacts, reorder swaps adjacent
- Webhooks signed with HMAC-SHA256 when secret configured
