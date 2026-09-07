# POLINA VET — Production Operations Runbook

This is the current operator runbook for the M14.5 pause baseline. Never paste secrets, tokens, private inquiry data, clinical text, or raw request bodies into tickets, logs, screenshots, or this repository.

## Production endpoints and resources

- Public web: `https://lina.aipipeline.cc` via `polina-vet-production` (current version `d77c7f72-c465-4670-be50-d8a7025613ac`).
- Intake: `https://intake.lina.aipipeline.cc` via `polina-vet-intake-production` (current version `e438a3d5-55ab-4888-839e-eead6b1aab94`).
- Office: `https://office.lina.aipipeline.cc` via `polina-vet-office-production` (current version `fc31a944-e411-4556-9023-7587df57e6fc`).
- D1: `polina-vet-operations-production`; binding `DB`; database ID is maintained in the Wrangler production config.
- Learning telemetry: Analytics Engine dataset `polina_vet_learning_production`, separate from public analytics.
- Turnstile sitekey: `0x4AAAAAAErEOf48kdeZYNJZ`, scoped to `lina.aipipeline.cc`; the secret is stored only in Worker secret storage.

Use the package-local Wrangler config explicitly:

```powershell
pnpm --filter @polina-vet/intake exec wrangler d1 migrations list DB --remote --env production --config wrangler.jsonc
pnpm --filter @polina-vet/intake exec wrangler secret list --env production --config wrangler.jsonc
pnpm --filter @polina-vet/office exec wrangler deployments list --name polina-vet-office-production
```

The secret command is for names/types only. Do not use commands or scripts that print secret values.

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

## Intake activation

The production flag stays `PUBLIC_INTAKE_ENABLED=false`. Before any future enablement, all of the following must be evidenced: Access-protected Office; approved identity set; production Turnstile sitekey/secret; exact origin/CORS/CSP; rate limit, honeypot, server validation, idempotency, retention, audit, safe logging; published privacy notice/version and consent acknowledgement; Telegram PII-free notification configuration; Office URL; and the Article 22 evidence gate in `R3_PRODUCTION_COMPLIANCE_AND_INTAKE.md`.

Run synthetic acceptance only in a controlled environment, label any retained telemetry `SYNTHETIC`, remove all synthetic D1 rows/events, and verify zero leakage before enabling the flag. A notification failure must not expose PII or falsely report delivery.

## Observation and incident response

Observation is `READY / REAL OBSERVATION NOT YET STARTED` until the first genuine `REAL` event after protected Office activation. Do not backdate or manufacture a start date. For an incident: stop the affected flag/route, preserve only safe audit evidence, use the approved D1 Time Travel recovery decision, rotate affected credentials through Cloudflare/Sanity controls, and document the owner decision before restoring service.
