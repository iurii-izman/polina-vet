# POLINA VET

Static-first multilingual veterinary guidance and routing hub.

## Commands

- `pnpm dev` — run the Astro public site.
- `pnpm build` — generate Sanity types and build both applications.
- `pnpm check` — format, type/schema, content-policy, and production-build checks.
- `pnpm test:e2e` — Playwright critical-route smoke tests.
- `pnpm test:a11y` — axe accessibility checks.

## Local configuration

Copy `apps/studio/.env.example` to `apps/studio/.env` and supply a real Sanity project ID only when a project/dataset is approved. The initial Studio intentionally contains no production content.
