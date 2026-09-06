# M13 Acceptance

## Implementation status

| Area | State |
|---|---|
| Static public site preserved | PASS |
| Intake Worker and D1 schema | Implemented; staging deployed; production remains fail-closed |
| Office Worker, Quick Add, list/detail/actions | Implemented; staging deployed behind Access |
| Access JWT validation and role helper | Implemented and verified on the protected staging Office workflow |
| Public RU/RO/UK intake UI | Implemented; browser smoke passed; production disabled by default |
| Turnstile server validation | Implemented and verified with a real staging browser submission; production activation remains gated |
| Native rate limiting | Configured for base, staging, and production; staging protections remain active |
| Idempotency, validation, payload limits | Implemented and unit-tested |
| Telegram adapter | Implemented; staging secrets configured and real delivery verified with a PII-safe message; production inactive |
| Retention/Cron/dry-run | Implemented; production schedule and activation remain gated |
| Privacy map and notice | PASS; version 1.0 approved 2026-09-06 and published in RU/RO/UK |
| PII logging/cache/analytics boundary | Implemented and verified in code/tests |
| Responsive/mobile/accessibility | Office and form are mobile-first; E2E visual and accessibility suites pass |
| Localized routes/noindex | Implemented and verified for RU/RO/UK |
| Staging D1, Access, synthetic QA cleanup | PASS; real browser → Turnstile → Intake → staging D1 → Telegram → Office → cleanup verified |
| Production activation | OFF; Article 22 prior-notification evidence is the single external blocker |
| R1/R2 | Unchanged |
| M13 implementation | COMPLETE |
| M13 staging acceptance | PASS |
| M13 privacy/legal activation gate | FAIL — precise external prerequisite: Article 22 operator notification before processing |
| M14 | Not started |

## Resolved staging acceptance

- staging D1 is isolated from production and synthetic acceptance data was removed;
- the real browser intake flow used server-side Turnstile validation, exact-origin CORS, rate limiting, honeypot, validation, and idempotency;
- the real Telegram adapter delivered a notification containing only the public reference, context, locality, and protected Office link;
- the Office custom hostname required Cloudflare Access, validated the authorized session, and completed the status/outcome workflow with audit events;
- workers.dev and preview bypasses were unavailable;
- staging was restored to `PUBLIC_INTAKE_ENABLED=false` immediately after the smoke;
- production D1 had no writes from acceptance.

## Still open / intentional

### PRIVACY / LEGAL

- The owner-approved notice is version `1.0`, dated `2026-09-06`, with the approved identity, contact, purposes, rights route, and retention.
- The narrow current PMR check found one precise external prerequisite: submit the Article 22 operator notification before real Intake processing. See [M13 PMR Privacy Check](M13_PMR_PRIVACY_CHECK.md).

### OPTIONAL PRODUCTION ACTIVATION

- production Intake activation after the Article 22 notification evidence;
- production Turnstile, Office, Telegram, and exact-origin configuration where not already provisioned.

M13 implementation and staging acceptance are complete, but public Intake remains disabled because the single external notification prerequisite is open. This document does not declare public Intake live.
