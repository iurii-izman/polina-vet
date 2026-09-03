# POLINA VET

Static-first multilingual veterinary guidance and routing hub.

## Commands

- `pnpm dev` — run the Astro public site.
- `pnpm dev:studio` — run the local Sanity Studio.
- `pnpm build` — generate Sanity types and build both applications.
- `pnpm check` — format, type/schema, content-policy, and production-build checks.
- `pnpm test:e2e` — Playwright critical-route smoke tests.
- `pnpm test:a11y` — axe accessibility checks.
- `pnpm sanity:typegen` — extract the local Studio schema and generate frontend query types.
- `pnpm sanity:seed:safe` — idempotently publish only the safe singleton settings and RU editorial-policy page.
- `pnpm sanity:verify` — read and validate published Sanity content without changing it.

## Local configuration

Copy both `.env.example` files to `.env` and use the same approved public project ID and `production` dataset:

- `apps/web/.env`: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`
- `apps/studio/.env`: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`

No read token is required for published content. Never create a duplicate project/dataset, add a token “for later”, bulk-delete content, or store private client/patient data. Deploy the schema only from the local Studio with `pnpm --filter @polina-vet/studio exec sanity schema deploy`, then run the explicit safe seed and remote verification commands above.
