# Architecture

## System Overview

```
┌──────────────┐     ┌──────────────────────────────────────┐
│              │     │           Go API (Echo v4)            │
│   Browser    │────>│                                      │
│              │     │  ┌──────────┐  ┌──────────────────┐  │
│  CMS SPA     │     │  │ Handlers │  │ Embedded CMS     │  │
│  (Svelte 5)  │     │  │ (REST)   │  │ (go:embed dist/) │  │
│              │     │  └────┬─────┘  └──────────────────┘  │
└──────────────┘     │       │                              │
                     │  ┌────▼─────┐  ┌──────────────────┐  │
                     │  │  Store   │  │  Auth Service     │  │
                     │  │ (pgx v5) │  │  (JWT + bcrypt)   │  │
                     │  └────┬─────┘  └───────┬──────────┘  │
                     │       │                │             │
                     └───────┼────────────────┼─────────────┘
                             │                │
                     ┌───────▼──┐      ┌──────▼───┐
                     │PostgreSQL│      │  Redis   │
                     │          │      │ (tokens) │
                     └──────────┘      └──────────┘
```

## CMS Frontend

Single-page application using hash-based routing (`#/dashboard`, `#/editor/project/:id`, etc.).

### Key Design Decisions

- **Svelte 5 runes**: `$state`, `$derived`, `$props`, `{#snippet}`, `{@render}`
- **No framework router**: Custom hash-based router in `router.svelte.js`
- **Auth**: HTTP-only cookie auth with automatic 401 -> refresh -> retry
- **Style**: Monochrome (black and white), Geist Sans, minimal "agentic UI"
- **Delete UX**: Inline two-click pattern (first click turns red "Are you sure?", second confirms). No modal popups.
- **Toasts**: Global toast notification system for all form feedback

### Component Structure

```
src/
  App.svelte              Root (router + global Toast)
  components/
    TopBar.svelte          Header: logo icon \ PAGE_NAME
    BottomNav.svelte       Floating dark pill navbar
    Toast.svelte           Toast notification overlay
  pages/
    Login.svelte           Auth login form
    Dashboard.svelte       Data tables, cards, project reorder
    Editor.svelte          Markdown editor with preview
    SkillForm.svelte       CRUD form
    ExperienceForm.svelte  CRUD form
    CvForm.svelte          CRUD form with active toggle
    ProfileForm.svelte     Profile/bio editor
    WebhookForm.svelte     Webhook endpoint management
    ChangePassword.svelte  Password change form
  lib/
    api.js                 HTTP client (fetch wrapper with auth retry)
    router.svelte.js       Hash-based SPA router
    auth.svelte.js         Auth state management
    toast.svelte.js        Toast notification state
  assets/
    Face logo.svg          Primary CMS brand mark
```

## Go API

### Store Interface

All database operations go through the `Store` interface in `handlers/api.go`. This enables testing and ensures all methods are accounted for at compile time.

### Project Sort Order

- 0-based contiguous ordering (0 to N-1)
- New projects get `sort_order = COUNT(*)`
- Delete recompacts: decrements all sort_orders above the deleted item
- Reorder endpoint: `POST /admin/projects/:id/reorder` with `{ direction: 1 | -1 }` atomically swaps adjacent sort_orders

### Webhooks

Content changes dispatch events to registered webhook endpoints. Events are signed with HMAC-SHA256 if the endpoint has a secret configured.

### Migrations

Sequential SQL files in `apps/api/migrations/`:

1. `001_initial.sql` — Base schema (users, projects, blogs, tags, skills, experience, cv, profile, webhooks)
2. `002_project_sort_blog_tags.sql` — Adds sort_order to projects, tags to blogs
3. `003_normalize_sort_order.sql` — Normalizes existing sort_order to contiguous 0-based values
