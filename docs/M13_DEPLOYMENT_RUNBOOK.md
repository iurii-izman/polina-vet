# M13 Deployment Runbook

## Local

Use synthetic data only. Copy no `.dev.vars` into git. Run the intake and Office Workers with Wrangler and apply the local migration. Test the form with the explicit test Turnstile mode only.

## Staging

The M13 staging deployment and acceptance path is complete: separate staging D1 bindings are applied, `polina-vet-intake --env staging` and `polina-vet-office --env staging` are deployed, and the Office custom hostname is behind Cloudflare Access. No workers.dev or preview origin is enabled. The real browser path verified no-store headers, Access JWT validation, Turnstile, form write, Office read/update, the Telegram adapter, operational status/outcome handling, audit events, and synthetic cleanup. Restore `PUBLIC_INTAKE_ENABLED=false` after any controlled smoke.

## Production preparation

Do not enable the public form in this pass. Configure production D1, Access, Turnstile secret/sitekey, approved privacy version, rate limiter, and optional Telegram secrets only after review. Apply the migration manually, verify recovery procedure, smoke test with controlled synthetic data, then obtain final human approval before changing the feature flag.

Secrets use Wrangler/Cloudflare secret management; never put them in source, vars, screenshots, logs, or PR text.
