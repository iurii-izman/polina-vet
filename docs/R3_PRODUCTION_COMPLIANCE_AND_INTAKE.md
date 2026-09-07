# R3 — Complete production compliance and deferred Intake obligations

**Status:** OPEN / TECHNICAL AND EXTERNAL PREREQUISITES DEFERRED
**Tracking issue:** [#18](https://github.com/iurii-izman/polina-vet/issues/18)

R3 is the remaining production-operations gate. The owner accepted public launch with notification evidence deferred. This is an operational override, not a legal-compliance conclusion.

## Completed baseline

- Production D1 exists and has `0001` plus `0002_m14_core` applied.
- Production operational tables are empty and the foreign-key check is clean.
- Production Turnstile is scoped to the temporary public origin and the Worker secret is stored outside the repository.
- The Office and Intake Worker configurations remain fail-closed/disabled.
- Public Intake does not claim availability and no real production inquiry was created.

## Still required before real Intake

- Create/configure a Cloudflare Access application for the exact Office hostname.
- Supply and verify the approved Office identities; preserve server-side JWT validation and `OFFICE_AUTH_BYPASS=false`.
- Supply production Telegram bot/chat credentials through Cloudflare secret storage and verify PII-free notification behavior.
- Complete the Article 22 operator-notification evidence package; see `R3_ARTICLE_22_NOTIFICATION_PACKAGE.md`.
- Run a fresh controlled synthetic E2E, clean all synthetic D1 rows/events, then perform the real enablement change only after owner approval.

## Safety classification

The current PMR review remains **LEGAL PRODUCT GATE: FAIL / EXTERNAL PREREQUISITE OPEN** for real public Intake. The product does not claim Article 22 compliance, filing, registration, or legal advice. `PUBLIC_INTAKE_ENABLED=false` is the required current state.

## Observation relation

M14.5 observation is independent from public Plausible and starts only after protected Office activation and the first genuine `REAL` event. No synthetic acceptance event may be used as the observation start.
