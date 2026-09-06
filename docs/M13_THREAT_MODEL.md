# M13 Threat Model

| Threat | Mitigations | Residual gate |
|---|---|---|
| Spam/flooding | Turnstile server verification, native Workers Rate Limiting, honeypot, request/body limits | Production activation and secret gate |
| XSS | Length-limited input, HTML escaping in Office, no public HTML rendering | E2E/security review |
| SQL injection | Parameterized D1 statements, controlled enums, unknown-field rejection | D1 integration tests |
| CSRF/origin abuse | Exact allowlisted Origin, CORS only for configured public hosts, idempotency key; staging hosts verified | Verify final production hosts at activation |
| Access bypass | No workers.dev/preview URLs, Access JWT signature/audience/issuer/expiry validation, server-side role mapping; staging workflow verified | Production hostname/application activation |
| Cache leakage | Office and API `no-store`, no service worker, no PII browser storage | Staging header checks |
| Enumeration | Public response contains only a reference; no public read endpoint; opaque internal ids | Review deployed routing |
| Notification leakage | Reference/domain/locality only; secrets remain Worker secrets; creation does not depend on Telegram; staging delivery verified | Production Telegram activation, if selected |
| Retention failure | `retention_until`, daily UTC Cron, dry-run helper, cascading delete | Staging dry-run and production schedule |
| Accidental deletion | No UI hard-delete in M13; explicit migration/operations procedure | Future reviewed workflow |

M13 does not introduce medical diagnosis, treatment protocols, owner dosing, chat ingestion, or client/animal/visit records.
