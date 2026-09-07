# M14.5 Acceptance

This file records the M14.5 implementation evidence and its final closure state. Historical PR evidence remains useful, while current production facts are maintained in `PROJECT_STATUS.md` and `OPERATIONS_RUNBOOK.md`.

## Local gates

- `pnpm test:m14-5`
- `pnpm check`
- `pnpm test:m13`
- `pnpm test:m14`
- `pnpm release:validate`
- `pnpm test:e2e`
- `pnpm test:a11y`
- `git diff --check`

## Required authenticated staging evidence

- PET and FARM synthetic workflows emit only safe structural events.
- Search records result count/duration, never search text.
- Completed-record correction and stale-version conflict preserve audit accountability without IDs or clinical values in Analytics Engine.
- Correct Office Origin succeeds; wrong or missing Origin on configured browser mutations returns 403; scheduled work is unaffected.
- A telemetry sink failure does not fail a clinical mutation.
- Daily snapshot contains counts only and its failure does not stop retention.
- Logs contain controlled route class, operation, result, status, error code, duration, and request ID where appropriate; no body, raw URL/query, PII, clinical text, or arbitrary exception message.
- Staging and production Analytics Engine datasets are physically separate.
- Canary leakage count is zero across accessible logs, telemetry, client events, and traces.

## Final release boundary

`PUBLIC_INTAKE_ENABLED=false`; public analytics remains off; the temporary public site is indexable only after the explicit production SEO verification; production M14 migration is applied with zero operational rows; production clinical real-data processing is not activated; R1/R2/R3 remain open; observation is `READY / REAL OBSERVATION NOT YET STARTED` until the first genuine `REAL` telemetry event after Office activation.

Trace status must be recorded truthfully as `CONFIGURED`, `VERIFIED`, `CONFIGURED BUT EXTERNAL VIEW NOT AVAILABLE`, or `NOT STARTED`. No synthetic event may be used to start observation.

## Current evidence snapshot — 2026-09-07

- Production database `polina-vet-operations-production` has migrations `0001` and `0002_m14_core` applied, zero inquiry/clinical/audit rows, and a clean foreign-key check.
- Production Turnstile is provisioned for the temporary public origin and its Worker secret is present by name. The sitekey is kept in the deployment runbook, not in this acceptance record.
- Production Cloudflare Access has no application configured. Approved Office identities and production Telegram credentials were not supplied; Office stays fail-closed and Intake stays disabled.
- The corrected public build has absolute temporary-origin canonical, Open Graph, sitemap, and alternate links. Public Plausible remains disabled.
- The PMR Article 22 notification prerequisite remains unresolved. The owner override accepts launch with notification evidence deferred; this is not a legal-compliance claim.
