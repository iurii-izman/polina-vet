# M14.5 Acceptance

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

## Release boundary

`PUBLIC_INTAKE_ENABLED=false`; public analytics remains off; temporary public site remains noindex; production M14 migration is not applied; production clinical real-data processing is not activated; R1/R2/R3 remain open; observation period is NOT STARTED.

Trace status must be recorded truthfully as `CONFIGURED`, `VERIFIED`, or `CONFIGURED BUT EXTERNAL VIEW NOT AVAILABLE`.
