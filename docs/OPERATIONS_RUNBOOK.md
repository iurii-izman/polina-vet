# POLINA VET — Production Operations Runbook

This is the current operator runbook for the M14.5 pause baseline. Never paste secrets, tokens, private inquiry data, clinical text, or raw request bodies into tickets, logs, screenshots, or this repository.

## Production endpoints and resources

- Public web: `https://lina.aipipeline.cc` via `polina-vet-production` (current version `97a16620-00d3-4f84-9d17-679ac75bd797`).
- Intake: `https://intake.lina.aipipeline.cc` via `polina-vet-intake-production` (current version `cdc98294-1751-4957-affd-670368d35928`; active).
- Office: `https://office.lina.aipipeline.cc` via `polina-vet-office-production` (current secret-change deployment `6762c21c-6677-442d-85c3-c47b55a2b393`; fail-closed).
- D1: `polina-vet-operations-production`; binding `DB`; database ID is maintained in the Wrangler production config.
- Learning telemetry: Analytics Engine dataset `polina_vet_learning_production`, separate from public analytics.
- Turnstile sitekey: `0x4AAAAAAEtyB6Jmw_57IG3c`, scoped to `lina.aipipeline.cc`; the secret is stored only in Worker secret storage. One live production browser token passed Siteverify.

Use the package-local Wrangler config explicitly:

```powershell
pnpm --filter @polina-vet/intake exec wrangler d1 migrations list DB --remote --env production --config wrangler.jsonc
pnpm --filter @polina-vet/intake exec wrangler secret list --env production --config wrangler.jsonc
pnpm --filter @polina-vet/office exec wrangler deployments list --name polina-vet-office-production
```

The secret command is for names/types only. Do not use commands or scripts that print secret values.

The current production boundary is: unauthenticated Office requests reach the separate Cloudflare Access challenge, Intake accepts only exact-origin requests with active Turnstile and server-side validation, production D1 reports zero inquiry, clinical, audit, and client rows after synthetic cleanup, and the production Office deployment exposes the separate learning telemetry binding. The owner-supplied identity allowlist is stored as a Worker secret and is not printed or committed. Administrator Google login and prior synthetic Office acceptance passed; the second approved identity remains optional runtime follow-up.

## Safe release sequence

1. Confirm the requested commit, branch, current `main` ancestry, and a clean worktree except the intentionally untracked `output/` directory.
2. Build with explicit `SITE_URL`, `SITE_INDEXABLE`, `DEPLOYMENT_TARGET`, and `PUBLIC_ANALYTICS_ENABLED` values. Use `SITE_INDEXABLE=true` only for the verified temporary or permanent production origin.
3. Run `pnpm check`, `pnpm test:e2e`, `pnpm test:a11y`, `pnpm release:validate`, and the live origin verifier.
4. Deploy only the named Worker with its explicit config. Record the deployment version ID, route, and verification result; never record secrets.
5. Verify HTTPS, security headers, canonical, hreflang, Open Graph, robots, sitemap, no staging/private routes, and no accidental token output.

## D1 migration and recovery

Production D1 currently has `0001` and `0002_m14_core` applied, zero operational rows, and a clean foreign-key check. Before a future migration, inspect schema and Time Travel status, record a non-secret operator bookmark, apply the versioned migration explicitly, and verify indexes/foreign keys. See `BACKUP_RECOVERY.md`.

Never copy production D1 into local, staging, tests, exports, or screenshots. Never delete a dataset or run an in-place restore without explicit incident approval.

## Office and Access

`OFFICE_AUTH_BYPASS=false` is mandatory in production. A production Office request must fail closed unless a valid Cloudflare Access JWT is verified server-side against the configured team domain, audience, and approved identity allowlist. Do not broaden identities or create an Access application without exact owner-supplied values and an authenticated control-plane change.

The production Access application and policy are configured for the exact Office hostname. The administrator Google login reached Office UI and the controlled PET/FARM synthetic acceptance was completed and cleaned. Do not broaden the exact two-identity allowlist or enable `OFFICE_AUTH_BYPASS`.

## Intake activation

The production flag is `PUBLIC_INTAKE_ENABLED=true` under the owner-authorized technical launch decision. Evidence includes Access-protected Office; exact two-identity set; production Turnstile sitekey/secret; exact origin/CORS/CSP; rate limit, honeypot, server validation, idempotency, retention, audit, safe logging; published privacy notice/version and consent acknowledgement; and the protected Office URL. Telegram remains cleanly disabled because secure production credentials are unavailable. Article 22 evidence remains pending and is not represented as legal compliance.

If a future controlled synthetic run is required, label any retained telemetry `SYNTHETIC`, remove all synthetic D1 rows/events, and verify zero leakage. The completed production E2E left D1 operational counts at zero and `PRAGMA foreign_key_check` clean. A notification failure must not expose PII or falsely report delivery.

## Observation and incident response

Observation is `READY / REAL OBSERVATION NOT YET STARTED` until the first genuine `REAL` event after protected Office activation. Do not backdate or manufacture a start date. For an incident: stop the affected flag/route, preserve only safe audit evidence, use the approved D1 Time Travel recovery decision, rotate affected credentials through Cloudflare/Sanity controls, and document the owner decision before restoring service.
