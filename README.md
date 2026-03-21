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
| Website   | Next.js                                                   |
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

- **Dashboard** — Overview cards, data tables for all content types, inline tag editing, project reordering
- **Editor** — Markdown editor for projects and blog posts with live preview
- **Skills** — CRUD for technical skills
- **Experience** — CRUD for work experience
- **CV** — Upload/manage CVs with active toggle
- **Profile** — Edit site profile/bio
- **Webhooks** — Manage webhook endpoints for content change notifications
- **Settings** — Change password

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
| POST   | `/api/v1/admin/upload`            | Upload file              |
| GET    | `/api/v1/admin/webhooks`          | List webhooks            |
| POST   | `/api/v1/admin/webhooks`          | Create webhook           |
| PUT    | `/api/v1/admin/webhooks/:id`      | Update webhook           |
| DELETE | `/api/v1/admin/webhooks/:id`      | Delete webhook           |
