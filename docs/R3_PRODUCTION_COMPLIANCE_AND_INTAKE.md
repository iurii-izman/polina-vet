# R3 — Complete production compliance and deferred Intake obligations

**Status:** OPEN / RUNTIME ACCEPTANCE AND COMPLIANCE EVIDENCE DEFERRED
**Tracking issue:** [#18](https://github.com/iurii-izman/polina-vet/issues/18)

R3 is the remaining production-operations gate. The owner accepted public launch with notification evidence deferred. This is an operational override, not a legal-compliance conclusion.

## Completed baseline

- Production D1 exists and has `0001` plus `0002_m14_core` applied.
- Production operational tables are empty and the foreign-key check is clean.
- Production Turnstile is scoped to the temporary public origin and the Worker secret is stored outside the repository.
- Fixed security-hardening source is deployed; the current Office production secret-change deployment is `b0356307-7a3d-4889-8b9f-11add36e8f41`, and Intake remains on the fixed disabled deployment `4e40cc17-5ed9-4330-b887-372ff9a3b6fc`.
- A separate production Cloudflare Access application/policy protects the exact Office hostname. The configured team domain, audience, and owner-supplied identity allowlist are bound to production; the identity values are not stored in the repository.
- Office remains fail-closed with `OFFICE_AUTH_BYPASS=false`; an unauthenticated request reaches the Access challenge. The approved identity login was not completed during this run because the verification email did not arrive, so Office workflow acceptance remains unverified. Intake remains disabled with `PUBLIC_INTAKE_ENABLED=false`.
- Production Office has the separate `polina_vet_learning_production` Analytics Engine binding, with no real observation event started.
- Public Intake does not claim availability and no real production inquiry was created.

## Still required before real Intake

- Complete the approved-identity login in the protected Office browser flow; where practical, verify both owner-approved identities. Preserve server-side JWT validation and `OFFICE_AUTH_BYPASS=false`.
- Run the controlled synthetic Office acceptance: PET and FARM happy paths plus unauthorized/adversarial cases. Use only synthetic data, verify PII-free audit/telemetry, and remove all synthetic D1 rows/events afterward.
- Production Telegram remains optional; if enabled later, supply bot/chat credentials through Cloudflare secret storage and verify PII-free notification behavior.
- Complete the Article 22 operator-notification evidence package; see `R3_ARTICLE_22_NOTIFICATION_PACKAGE.md`.
- After Office acceptance and the Article 22 decision are recorded, run the technical Intake E2E, clean all synthetic D1 rows/events, and perform any real enablement change only after explicit owner approval. The current owner override permits technical launch with evidence deferred, but it does not authorize real Intake while runtime acceptance is incomplete.

## Safety classification

The current PMR review remains **LEGAL PRODUCT GATE: FAIL / EXTERNAL PREREQUISITE OPEN** for real public Intake. The owner launch decision accepts release with evidence deferred; this is not a legal-compliance conclusion. The product does not claim Article 22 compliance, filing, registration, or legal advice. `PUBLIC_INTAKE_ENABLED=false` is the required current state.

## Observation relation

M14.5 observation is independent from public Plausible and starts only after protected Office activation and the first genuine `REAL` event. No synthetic acceptance event may be used as the observation start.
