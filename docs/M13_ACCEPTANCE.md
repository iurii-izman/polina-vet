# M13 Acceptance

| Area | State |
|---|---|
| Static public site preserved | Implemented |
| Intake Worker and D1 schema | Implemented, binding activation-gated |
| Office Worker, Quick Add, list/detail/actions | Implemented, Access-gated |
| Access JWT validation and role helper | Implemented, identities/configuration required |
| Public RU/RO/UK intake UI | Implemented, disabled by default |
| Turnstile server validation | Implemented, production secret required |
| Native rate limiting | Binding configured in template, staging verification required |
| Idempotency, validation, payload limits | Implemented and unit-tested |
| Telegram adapter | Implemented, disabled without secrets |
| Retention/Cron/dry-run | Implemented, staging/production verification required |
| Privacy map and notice | Map implemented; notice approval required |
| PII logging/cache/analytics boundary | Implemented in code and documented |
| Responsive/mobile/accessibility | Office and form are mobile-first; render QA required |
| Localized routes/noindex | Implemented for RU/RO/UK |
| Staging D1, Access, synthetic QA cleanup | Not verified in this local pass |
| Production activation | OFF; not authorized |
| R1/R2 | Unchanged |
| M14 | Not started |

This document must not be changed to COMPLETE until the activation-gated rows have evidence.
