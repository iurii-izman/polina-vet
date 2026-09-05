# ADR-M13: private intake and lightweight operations foundation

Status: accepted for implementation; production activation gated

## Decision

Keep the public Astro site static-first and introduce two isolated Cloudflare Workers:

1. `polina-vet-intake` exposes only `POST /api/intake` and writes validated inquiries to the private D1 database.
2. `polina-vet-office` serves the private operational UI and authenticated inquiry actions from the same D1 database.

`packages/operations` owns the inquiry contract, validation, SQL operations, status transitions, retention, Access JWT verification, safe logging, and the Telegram notification adapter. Sanity remains public editorial CMS only; no private inquiry data crosses into Sanity or public analytics.

The D1 database is named `polina-vet-operations` conceptually and is isolated per local, staging, and production environment. Migrations are versioned under `apps/intake/migrations/0001_init/migration.sql`. Production migrations remain explicit operator actions.

Public activation is fail-closed with `PUBLIC_INTAKE_ENABLED=false` until privacy approval, a real D1 binding, Access verification, Turnstile verification, native rate limiting, retention, notification fallback/reliability, and production smoke checks are complete.

## Important alternatives rejected

- Making the whole Astro site SSR: unnecessary coupling for one private intake endpoint.
- Storing operational data in Sanity: violates the public CMS/private PII boundary.
- Adding Supabase/Firebase/Postgres: unnecessary for the expected M13 volume and adds an external system.
- Password or custom OAuth sessions: Cloudflare Access already provides the identity boundary.
- Telegram ingestion/chat: outside M13; Telegram is only an outbound narrow notification adapter.
- Client-side or form-only Turnstile: server-side validation is mandatory.

## Current activation status

Implementation is PR-ready as a gated foundation. No production database, Access identities, Turnstile production secret, Telegram credentials, or approved privacy wording are assumed or embedded.

## Official references

- [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [Cloudflare D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Cloudflare Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
