# M13 Deployment Runbook

## Local

Use synthetic data only. Copy no `.dev.vars` into git. Run the intake and Office Workers with Wrangler and apply the local migration. Test the form with the explicit test Turnstile mode only.

## Staging

Create separate staging D1 binding/database, apply migrations explicitly, deploy `polina-vet-intake --env staging` and `polina-vet-office --env staging`, and place the Office custom hostname behind Cloudflare Access. Confirm no workers.dev or preview origin is enabled. Verify no-store headers, Access JWT validation, form write, Office read/update, Telegram disabled behavior, and retention dry-run with synthetic records. Remove QA records at the end.

## Production preparation

Do not enable the public form in this pass. Configure production D1, Access, Turnstile secret/sitekey, approved privacy version, rate limiter, and optional Telegram secrets only after review. Apply the migration manually, verify recovery procedure, smoke test with controlled synthetic data, then obtain final human approval before changing the feature flag.

Secrets use Wrangler/Cloudflare secret management; never put them in source, vars, screenshots, logs, or PR text.
