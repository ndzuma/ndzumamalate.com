# Project Checklist

## Workspace

- [x] Initialize the monorepo with Turborepo.
- [x] Use Bun as the package manager and build tool.
- [ ] Keep the repository public on GitHub.

## Website

- [x] Initialize `apps/web` with Next.js using the App Router.
- [ ] Use Geist Sans.
- [ ] Use Phosphor Icons.
- [ ] Use Motion for animations.
- [ ] Add PostHog analytics.
- [ ] Remove Vercel branding from the repository and deployment, including default error pages, analytics, and telemetry.
- [ ] Build a public "This Website" page covering the stack, design tokens, architecture diagrams, and component inventory.

## CMS

- [ ] Initialize `apps/cms` with Svelte.
- [ ] Add a Markdown editor for projects.
- [ ] Add a Markdown editor for blog posts.
- [ ] Use Phosphor Icons.

## API

- [ ] Build `apps/api` in Go using Echo.
- [ ] Implement native authentication in Go.
- [ ] Use `golang-jwt/jwt` v5 for JWT signing and verification.
- [ ] Hash passwords with `bcrypt`.
- [ ] Use HTTP-only, Secure cookies for session transport.
- [ ] Integrate Resend for contact form notifications.

## Data

- [ ] Use PostgreSQL as the primary database.
- [ ] Use Redis for session storage.
- [ ] Use Redis for rate limiting.
- [ ] Use Redis for caching hot content.
- [ ] Use UploadThing for project images.
- [ ] Use UploadThing for CV uploads.
- [ ] Create database tables for `projects`, `project_tags`, `tags`, `blogs`, `skills`, `experience`, `cv`, and `profile`.
- [ ] Model `profile` as a single-row configuration table.

## Auth

- [ ] Hash passwords with a bcrypt cost factor of 12 or higher.
- [ ] Sign JWTs with RS256.
- [ ] Verify JWTs with the corresponding public key.
- [ ] Deliver tokens via HTTP-only, Secure, `SameSite=Strict` cookies.
- [ ] Store refresh token rotation state in Redis with expiry.
- [ ] Add Redis-backed rate limiting on `/auth/login`.

## Docs

- [ ] Add Mermaid architecture diagrams to `docs/architecture.md`.
- [ ] Record architecture decisions in `docs/decisions/`.

## Infra

- [ ] Add infrastructure for PostgreSQL.
- [ ] Add infrastructure for Redis.

## GitHub

- [ ] Add GitHub Actions workflows for `web`, `cms`, and `api`.
