# ndzumamalate.com

Personal website and CMS for Ndzuma Malate. Monorepo with a Go API, Svelte 5 admin CMS, and Next.js public site.

## Architecture

```
apps/
  api/     Go API (Echo, PostgreSQL, Redis, JWT auth)
  cms/     Svelte 5 CMS admin (embedded into API via go:embed)
  web/     Next.js public website
infra/     Deployment & infrastructure config
docs/      Architecture documentation
```

The CMS is a single-page application built with Svelte 5 and Vite 8. On build, the output is copied into the Go API's `internal/cms/dist/` directory and served via `go:embed`.

## Tech Stack

| Layer     | Tech                                                      |
| --------- | --------------------------------------------------------- |
| API       | Go, Echo v4, pgx v5, JWT, Redis, HMAC webhook signing, CORS & Rate limiting |
| CMS       | Svelte 5 (runes), Vite 8, Geist Sans, phosphor-svelte    |
| Website   | Next.js (dynamic rendering + in-process content cache, live-synced from the API event stream) |
| DB        | PostgreSQL                                                |
| Cache     | Redis (session/token store)                               |
| Tooling   | Bun workspaces, Turborepo                                 |

## Development

```sh
# Install dependencies
bun install

# Run CMS dev server + Go API in parallel
bun dev

# CMS only
cd apps/cms && bun dev

# API only
cd apps/api && go run ./cmd/server
```

## Build & Deploy

```sh
# Build CMS
cd apps/cms && bun run build

# Sync CMS dist into Go API embed directory
cd apps/cms && bun run sync:api

# Build Go API (includes embedded CMS)
cd apps/api && go build -o server ./cmd/server
```

## CMS Pages

- **Dashboard** — Overview stats, featured projects, drafts, login activity
- **Collections** — Tables for projects, writings, skills, experience, CVs and tags (inline toggles, reordering, two-click delete)
- **Editor** — Markdown editor for projects and writings with live preview
- **Pages** — Edit the homepage, the stack page and section intros. Rich text supports inline widget tokens (`{{f1}}`, `{{space}}`, `{{project:slug}}`, `{{social}}`, `{{email}}`, `{{cv}}`, `{{book}}`, `{{music}}`, `{{tech}}`, `{{link:url|Label}}`), `**bold**` and `[text](url)`; the "Insert widget" toolbar inserts them at the caret
- **Profile** — Social links, listening/reading, open-to-work
- **Webhooks** — Optional endpoints for third-party notifications (HMAC-signed)
- **Settings** — Change password

## Content sync

The public site does not use ISR or build-time data. Every page renders on demand from an in-process content cache (`apps/web/lib/cache.ts`). On boot the Next.js server subscribes to the API's SSE stream (`apps/web/instrumentation.ts` → `lib/live-sync-server.ts`); each CMS change invalidates and re-warms the cache through `POST /api/revalidate`, then fans a `change` event out to open browser tabs via `/api/live`, which call `router.refresh()`. Failed refetches keep serving the last good value, so an API restart can never produce an empty site.

Manual invalidation: `curl -X POST https://ndzumamalate.com/api/revalidate -H "Authorization: Bearer $WEBHOOK_SECRET"`.

## API Endpoints

All admin endpoints require JWT auth via HTTP-only cookies with automatic refresh on 401.

| Method | Path                              | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | `/api/v1/auth/login`              | Login                    |
| POST   | `/api/v1/auth/logout`             | Logout                   |
| POST   | `/api/v1/auth/refresh`            | Refresh token            |
| GET    | `/api/v1/auth/me`                 | Current user             |
| GET    | `/api/v1/auth/activity`           | Recent login activity    |
| POST   | `/api/v1/auth/change-password`    | Change password          |
| GET    | `/api/v1/admin/projects`          | List projects            |
| POST   | `/api/v1/admin/projects`          | Create project           |
| PUT    | `/api/v1/admin/projects/:id`      | Update project           |
| DELETE | `/api/v1/admin/projects/:id`      | Delete project           |
| POST   | `/api/v1/admin/projects/:id/reorder` | Reorder project       |
| GET    | `/api/v1/admin/blogs`             | List blogs               |
| POST   | `/api/v1/admin/blogs`             | Create blog              |
| PUT    | `/api/v1/admin/blogs/:id`         | Update blog              |
| DELETE | `/api/v1/admin/blogs/:id`         | Delete blog              |
| GET    | `/api/v1/admin/tags`              | List tags                |
| POST   | `/api/v1/admin/tags`              | Create tag               |
| PUT    | `/api/v1/admin/tags/:id`          | Update tag               |
| DELETE | `/api/v1/admin/tags/:id`          | Delete tag               |
| GET    | `/api/v1/admin/skills`            | List skills              |
| POST   | `/api/v1/admin/skills`            | Create skill             |
| PUT    | `/api/v1/admin/skills/:id`        | Update skill             |
| DELETE | `/api/v1/admin/skills/:id`        | Delete skill             |
| GET    | `/api/v1/admin/experience`        | List experience          |
| POST   | `/api/v1/admin/experience`        | Create experience        |
| PUT    | `/api/v1/admin/experience/:id`    | Update experience        |
| DELETE | `/api/v1/admin/experience/:id`    | Delete experience        |
| GET    | `/api/v1/admin/cv`                | List CVs                 |
| POST   | `/api/v1/admin/cv`                | Create CV                |
| PUT    | `/api/v1/admin/cv/:id`            | Update CV                |
| DELETE | `/api/v1/admin/cv/:id`            | Delete CV                |
| GET    | `/api/v1/admin/profile`           | Get profile              |
| PUT    | `/api/v1/admin/profile`           | Update profile           |
| GET    | `/api/v1/admin/pages`             | List editable page content |
| PUT    | `/api/v1/admin/pages/:key`        | Update a page document (`home`, `stack`, `projects`, `writings`, `experience`) |
| POST   | `/api/v1/admin/upload`            | Upload file              |
| GET    | `/api/v1/admin/webhooks`          | List webhooks            |
| POST   | `/api/v1/admin/webhooks`          | Create webhook           |
| PUT    | `/api/v1/admin/webhooks/:id`      | Update webhook           |
| DELETE | `/api/v1/admin/webhooks/:id`      | Delete webhook           |

Public (no auth): `/api/v1/public/{projects,blogs,skills,experience,profile,tags,cv/active,pages,pages/:key,version,f1,space}` and the SSE stream at `/api/v1/public/events`.
