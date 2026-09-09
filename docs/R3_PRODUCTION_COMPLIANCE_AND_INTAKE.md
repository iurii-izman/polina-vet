# R3 — Complete production compliance and deferred Intake obligations

**Status:** OPEN / TECHNICAL ACTIVATION COMPLETE; ARTICLE 22 EVIDENCE DEFERRED
**Tracking issue:** [#18](https://github.com/iurii-izman/polina-vet/issues/18)

R3 is the remaining production-operations gate. The owner accepted public launch with notification evidence deferred. This is an operational override, not a legal-compliance conclusion.

## Completed baseline

- Production D1 exists and has `0001` plus `0002_m14_core` applied.
- Production operational tables are empty and the foreign-key check is clean.
- Production Turnstile is scoped only to `lina.aipipeline.cc`; the new production widget passed one live browser-token Siteverify path and the Worker secret is stored outside the repository.
- Fixed security-hardening source is deployed; the current Office production secret-change deployment is `6762c21c-6677-442d-85c3-c47b55a2b393`, and the accepted production Intake deployment is `cdc98294-1751-4957-affd-670368d35928`.
- A separate production Cloudflare Access application/policy protects the exact Office hostname. The configured team domain, audience, and owner-supplied identity allowlist are bound to production; the identity values are not stored in the repository.
- Office remains fail-closed with `OFFICE_AUTH_BYPASS=false`; the production administrator Google login reached the real Office UI, and the prior synthetic PET/FARM acceptance and cleanup completed successfully. The second approved operational identity remains a runtime follow-up. Intake is enabled with `PUBLIC_INTAKE_ENABLED=true` after one live synthetic browser E2E and complete cleanup.
- Production Office has the separate `polina_vet_learning_production` Analytics Engine binding, with no real observation event started.
- Public Intake is technically active under the owner-authorized launch decision. No real production inquiry was created; the one synthetic inquiry was deleted with all related rows.

## Remaining R3 follow-ups

- Where practical, complete the second approved operational Google login. Preserve server-side JWT validation and `OFFICE_AUTH_BYPASS=false`.
- Production Telegram remains optional; if enabled later, supply bot/chat credentials through Cloudflare secret storage and verify PII-free notification behavior.
- Complete the Article 22 operator-notification evidence package; see `R3_ARTICLE_22_NOTIFICATION_PACKAGE.md`.
- The technical Intake E2E is complete: one synthetic browser submission passed Turnstile, validation, JSON POST, D1 write, and cleanup. The current owner override permits technical launch with evidence deferred; it does not claim Article 22 compliance.

## Safety classification

The current PMR review remains **LEGAL PRODUCT GATE: FAIL / EXTERNAL PREREQUISITE OPEN**. The owner launch decision accepts technical release with evidence deferred; this is not a legal-compliance conclusion. The product does not claim Article 22 compliance, filing, registration, or legal advice. `PUBLIC_INTAKE_ENABLED=true` is the owner-authorized technical launch state.

## Observation relation

M14.5 observation is independent from public Plausible and starts only after protected Office activation and the first genuine `REAL` event. No synthetic acceptance event may be used as the observation start.
