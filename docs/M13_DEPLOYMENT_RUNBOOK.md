# M13 Deployment Runbook

## Local

Use synthetic data only. Copy no `.dev.vars` into git. Run the intake and Office Workers with Wrangler and apply the local migration. Test the form with the explicit test Turnstile mode only.

## Staging

The M13 staging deployment and acceptance path is complete: separate staging D1 bindings are applied, `polina-vet-intake --env staging` and `polina-vet-office --env staging` are deployed, and the Office custom hostname is behind Cloudflare Access. No workers.dev or preview origin is enabled. The real browser path verified no-store headers, Access JWT validation, Turnstile, form write, Office read/update, the Telegram adapter, operational status/outcome handling, audit events, and synthetic cleanup. Restore `PUBLIC_INTAKE_ENABLED=false` after any controlled smoke.

## Production preparation

Keep the public form disabled until the Article 22 operator-notification evidence is retained. Configure production D1, Access, Turnstile secret/sitekey, privacy version `1.0`, rate limiter, and approved Telegram secrets only through Cloudflare controls. Apply the migration manually and verify recovery procedure. A real production Intake smoke is not authorized while the notification prerequisite is open; use the already-verified staging synthetic path for end-to-end behavior. After the external prerequisite is complete, run a new controlled production synthetic smoke and only then change the feature flag.

Secrets use Wrangler/Cloudflare secret management; never put them in source, vars, screenshots, logs, or PR text.
