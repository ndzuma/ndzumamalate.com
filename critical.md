# Personal Website(ndzumamalate.com) — Project Strategy

## Overview

Open source personal website with a self-hosted CMS, unified Go backend, and a
Postgres + Redis data layer. Built to be fast, minimal, and fully owned.

## Monorepo Structure

Managed with **Turborepo**.

- apps/
- web/ → Next.js (personal website)
- cms/ → Svelte (admin CMS)
- api/ → Go (backend service)

## Tech Stack
- **Package manager and build tool:** Bun

### Web (apps/web)
- **Framework:** Next.js (App Router)
- **Font:** Geist Sans
- **Icons:** Phosphor Icons
- **Animations:** Motion (React Motion)
- **Analytics:** PostHog
- **Important:** strip all Vercel branding from repository and deployment, including default error pages, analytics, and
  telemetry. This is a fully custom personal site with no third-party branding.

### CMS (apps/cms)
- **Framework:** Svelte
- **Editor:** Markdown editor for projects and blog posts
- **Icons:** Phosphor Icons

### API (apps/api)
- **Language:** Go
- **Framework:** Echo
- **Auth:** Native Go — `golang-jwt/jwt` v5 for JWT signing/verification,
  `bcrypt` for password hashing, HTTP-only secure cookies for session transport.
  No third-party auth service.
- **Email:** Resend (contact form notifications)

### Data
- **Primary DB:** PostgreSQL
- **Cache / ephemeral state:** Redis (session store, rate limiting, caching hot
  content like active CV and skills)
- **Object store:** UploadThing (project images, CV file uploads)

## Database Tables

| Table | Purpose |
|---|---|
| `projects` | Project entries with markdown breakdown + image |
| `project_tags` | Many-to-many join between projects and tags |
| `tags` | Shared tags across projects |
| `blogs` | Blog posts in markdown |
| `skills` | Skills with category, proficiency, sort order |
| `experience` | Work history with location and dates |
| `cv` | CV file versions, one active at a time |
| `profile` | Open to work status, social links, reading link, playlists |

### `profile` table notes
Single-row config table for dynamic personal info:
- `open_to_work` (bool)
- `spotify_url`, `apple_music_url`
- `currently_reading_title`, `currently_reading_url`
- `github_url`, `twitter_url`, `linkedin_url`, and other socials

## Auth Strategy

Fully native Go, no external auth service:
- Passwords hashed with `bcrypt` (cost factor 12+)
- JWTs signed with RS256 (asymmetric — private key signs, public key verifies)
- Tokens delivered via HTTP-only, Secure, SameSite=Strict cookies
- Refresh token rotation stored in Redis with expiry
- Rate limiting on `/auth/login` via Redis

## Open Source

The full repo is public on GitHub and linked from the "This Website" page,
which documents the stack, design tokens, architecture diagrams, and component
inventory.
