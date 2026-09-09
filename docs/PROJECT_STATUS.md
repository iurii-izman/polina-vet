# POLINA VET — Current Project Status

**As of:** 2026-09-09
**Lifecycle:** M1–M14.5 closure baseline; development paused for real-world observation
**Current baseline:** `main` after the secure observation-baseline merge
**Baseline merge:** `7e87475add37a7d626d0efdc3d2a64db1230a9d2` (PR #25)
**Security hardening merge:** `139f1f93e26b1639355e32e8fb686783602ef74a` (PR #24)

## Alpha packaging state

The first explicit product alpha is packaged as `v0.1.0-alpha.1` from the secure pause baseline; the packaging merge is `4eb4af7da9f01a1a4e4db077a248ca01c7872f61`. The public site is live and indexable on `https://lina.aipipeline.cc`; the repository remains private, M1–M14.5 is closed, and development remains paused.

Production Office is **ACTIVE / ACCESS-PROTECTED**. The exact approved identity set is bound to the separate production Cloudflare Access application for `office.lina.aipipeline.cc`; the allowlist remains in Worker secret storage rather than source control. The production administrator Google login reached the real Office UI, and the prior synthetic PET/FARM acceptance and cleanup completed successfully. The second approved operational identity remains a small runtime follow-up. Office remains fail-closed with `OFFICE_AUTH_BYPASS=false`; production Intake is active after one synthetic E2E and cleanup with `PUBLIC_INTAKE_ENABLED=true`; real observation has not started.

The alpha package does not claim Article 22 notification, legal compliance, clinical availability, or a 24/7 service. Article 22 evidence remains pending under R3. The only permitted untracked local exception is `output/`.

## Launch decision

The public static site is launched on the temporary production origin `https://lina.aipipeline.cc`. The temporary origin is permitted to be indexable for this launch baseline when the production build is made with `SITE_URL=https://lina.aipipeline.cc`, `SITE_INDEXABLE=true`, and `DEPLOYMENT_TARGET=production`, and the live origin verifier passes. It is not the permanent SEO identity.

This launch does not claim legal compliance, clinical availability, or 24/7 coverage. Public Intake is technically active under the owner-authorized launch decision with Article 22 evidence deferred. `v1.0.0` is intentionally not created.

## Runtime state

| Area | State | Evidence / boundary |
| --- | --- | --- |
| Public web | LIVE on temporary origin | Static Cloudflare Worker `polina-vet-production`, version `97a16620-00d3-4f84-9d17-679ac75bd797`; canonical/OG/sitemap/alternate hosts are generated from the explicit origin. |
| Public indexability | ENABLED only on the verified production build | Preview, staging, local, and explicit non-indexable builds remain blocked by `robots.txt` and page metadata. |
| Public analytics | OFF | No verified owner-controlled Plausible domain/configuration. |
| Production D1 | PROVISIONED and migrated | `polina-vet-operations-production`; `0001` and `0002_m14_core` applied; zero inquiry, clinical, and audit rows; foreign-key check clean. |
| Office Worker | ACTIVE / ACCESS-PROTECTED / FAIL-CLOSED | Current production secret-change deployment `6762c21c-6677-442d-85c3-c47b55a2b393`; `OFFICE_AUTH_BYPASS=false`; production Access application/policy, team domain, audience, and exact two-identity secret are configured. Administrator Google login reached Office UI; second approved identity runtime login remains pending. |
| Intake Worker | ACTIVE / E2E ACCEPTED | Version `cdc98294-1751-4957-affd-670368d35928`; `PUBLIC_INTAKE_ENABLED=true`; one live synthetic browser submission passed Turnstile, validation, JSON POST, D1 write, and cleanup. |
| Turnstile | ACTIVE / SITEVERIFY VERIFIED | New production widget is scoped only to `lina.aipipeline.cc`; `TURNSTILE_SECRET_KEY` is stored as a Worker secret and is never committed or printed. One live production browser token passed the end-to-end Siteverify path. |
| Telegram | NOT CONFIGURED in production | No production bot/chat credentials were supplied. Failure must never expose PII or block a future database write. |
| Private learning telemetry | ACTIVE / READY / REAL OBSERVATION NOT YET STARTED | Production dataset `polina_vet_learning_production` is separate from public analytics and is bound to the production Office Worker. Synthetic events do not start the clock. |
| Sanity | VERIFIED / LOCAL TOKEN REVOKED | Published editorial verification passed; no private operational data is stored in Sanity. The ignored `POLINA VET Local Preview` token was revoked and the local value was removed. |
| Security hardening | CLOSED | Original scan had 7 findings; F1–F7 are resolved. Final Standard rescan `19752b76-87c4-4356-ba44-6da79e109685` reported 0 reportable findings with partial source coverage because delegated workers and external control-plane evidence were unavailable. |
| Dependency audit | R4 OPEN | `pnpm audit --prod --audit-level=moderate` reports 2 high and 4 moderate transitive advisories through Sanity CLI tooling; no compatible upstream patched graph was available, tracked in [R4](R4_UPSTREAM_DEPENDENCY_SECURITY_MAINTENANCE.md) and GitHub issue [#23](https://github.com/iurii-izman/polina-vet/issues/23). |

## Open external follow-ups

- **R1:** verify ownership and migrate the public canonical identity to `lina.vet`; then re-run SEO, redirect, Search Console, and sitemap checks. Never leave both origins independently indexable.
- **R2:** provide and verify owner-controlled external channels and, separately, any Plausible site/domain configuration. Keep public analytics off until explicit configuration exists.
- **R3:** retain Article 22 notification evidence as the legal/compliance follow-up; optionally complete the second approved Google login and configure Telegram if secure credentials become available. Technical Office and Intake activation is complete. See `R3_PRODUCTION_COMPLIANCE_AND_INTAKE.md`.

The owner-approved launch override is: **technical launch accepted with notification evidence deferred**. This records an operational decision; it does not convert the PMR gate into a pass or create a legal-compliance claim. Technical Intake processing is active under the recorded owner decision.

## Intentionally unresolved facts

Polina's full name/title/employer wording, contacts, geography, availability, education, real cases, reviewed red-flag wording, final RO/Moldavian policy wording, legal status, permanent domain ownership, external channels, Telegram credentials, second approved identity runtime login, and Article 22 route/filing evidence remain owner-supplied or externally verified inputs.

## Restart rule

Any new implementation work must first follow `PAUSE_AND_RESTART.md`, create a new milestone request/branch, and preserve the frozen product and privacy boundaries.
