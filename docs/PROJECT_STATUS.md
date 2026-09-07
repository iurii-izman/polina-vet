# POLINA VET — Current Project Status

**As of:** 2026-09-07
**Lifecycle:** M1–M14.5 closure baseline; development paused for real-world observation
**Current baseline:** `main` after the secure observation-baseline merge
**Baseline merge:** `7e87475add37a7d626d0efdc3d2a64db1230a9d2` (PR #25)
**Security hardening merge:** `139f1f93e26b1639355e32e8fb686783602ef74a` (PR #24)

## Alpha packaging state

The first explicit product alpha is packaged as `v0.1.0-alpha.1` from the secure pause baseline; the packaging merge is `4eb4af7da9f01a1a4e4db077a248ca01c7872f61`. The public site is live and indexable on `https://lina.aipipeline.cc`; the repository remains private, M1–M14.5 is closed, and development remains paused.

Production Office activation is **BLOCKED — OWNER IDENTITY INPUT REQUIRED**. The exact owner-approved Access identity set is not present in repository configuration or current documentation and must not be guessed. Office therefore remains fail-closed with `OFFICE_AUTH_BYPASS=false`; public Intake remains disabled with `PUBLIC_INTAKE_ENABLED=false`; real observation has not started. This is the single operational blocker for daily veterinary use.

The alpha package does not claim Article 22 notification, legal compliance, clinical availability, or a 24/7 service. Article 22 evidence remains pending under R3. The only permitted untracked local exception is `output/`.

## Launch decision

The public static site is launched on the temporary production origin `https://lina.aipipeline.cc`. The temporary origin is permitted to be indexable for this launch baseline when the production build is made with `SITE_URL=https://lina.aipipeline.cc`, `SITE_INDEXABLE=true`, and `DEPLOYMENT_TARGET=production`, and the live origin verifier passes. It is not the permanent SEO identity.

This launch does not claim legal compliance, clinical availability, 24/7 coverage, or that Intake is active. `v1.0.0` is intentionally not created.

## Runtime state

| Area | State | Evidence / boundary |
| --- | --- | --- |
| Public web | LIVE on temporary origin | Static Cloudflare Worker `polina-vet-production`, version `2f00f6bc-8cb6-4522-bf2f-513303cc0f7e`; canonical/OG/sitemap/alternate hosts are generated from the explicit origin. |
| Public indexability | ENABLED only on the verified production build | Preview, staging, local, and explicit non-indexable builds remain blocked by `robots.txt` and page metadata. |
| Public analytics | OFF | No verified owner-controlled Plausible domain/configuration. |
| Production D1 | PROVISIONED and migrated | `polina-vet-operations-production`; `0001` and `0002_m14_core` applied; zero inquiry, clinical, and audit rows; foreign-key check clean. |
| Office Worker | FIXED SOURCE DEPLOYED FAIL-CLOSED / ACTIVATION BLOCKED | Version `f1a03d88-b99c-40c3-a747-18821c74a424`; `OFFICE_AUTH_BYPASS=false`; production Access application/team/audience and the exact approved identity set are not configured, so unauthenticated access returns 401 and Office is not usable yet. |
| Intake Worker | FIXED SOURCE DEPLOYED DISABLED | Version `4e40cc17-5ed9-4330-b887-372ff9a3b6fc`; `PUBLIC_INTAKE_ENABLED=false`; disabled requests return 404 and no public processing is active. |
| Turnstile | CONFIGURED | Production widget is scoped to `lina.aipipeline.cc`; secret is stored in Worker secret storage and is never committed or printed. |
| Telegram | NOT CONFIGURED in production | No production bot/chat credentials were supplied. Failure must never expose PII or block a future database write. |
| Private learning telemetry | CONFIGURED / READY / REAL OBSERVATION NOT YET STARTED | Production dataset `polina_vet_learning_production` is separate from public analytics and is bound to the fixed production Office Worker. Synthetic events do not start the clock. |
| Sanity | VERIFIED / LOCAL TOKEN REVOKED | Published editorial verification passed; no private operational data is stored in Sanity. The ignored `POLINA VET Local Preview` token was revoked and the local value was removed. |
| Security hardening | CLOSED | Original scan had 7 findings; F1–F7 are resolved. Final Standard rescan `19752b76-87c4-4356-ba44-6da79e109685` reported 0 reportable findings with partial source coverage because delegated workers and external control-plane evidence were unavailable. |
| Dependency audit | R4 OPEN | `pnpm audit --prod --audit-level=moderate` reports 2 high and 4 moderate transitive advisories through Sanity CLI tooling; no compatible upstream patched graph was available, tracked in [R4](R4_UPSTREAM_DEPENDENCY_SECURITY_MAINTENANCE.md) and GitHub issue [#23](https://github.com/iurii-izman/polina-vet/issues/23). |

## Open external follow-ups

- **R1:** verify ownership and migrate the public canonical identity to `lina.vet`; then re-run SEO, redirect, Search Console, and sitemap checks. Never leave both origins independently indexable.
- **R2:** provide and verify owner-controlled external channels and, separately, any Plausible site/domain configuration. Keep public analytics off until explicit configuration exists.
- **R3:** supply the exact production Access application/team/audience and approved identity set before Office can become usable; complete the Article 22 evidence gate before enabling real Intake. Production Telegram remains optional and disabled. See `R3_PRODUCTION_COMPLIANCE_AND_INTAKE.md`.

The owner-approved launch override is: **launch accepted with notification evidence deferred**. This records an operational decision; it does not convert the PMR gate into a pass or authorize real Intake processing.

## Intentionally unresolved facts

Polina's full name/title/employer wording, contacts, geography, availability, education, real cases, reviewed red-flag wording, final RO/Moldavian policy wording, legal status, permanent domain ownership, external channels, production Access identities, Telegram credentials, and Article 22 route/filing evidence remain owner-supplied or externally verified inputs.

## Restart rule

Any new implementation work must first follow `PAUSE_AND_RESTART.md`, create a new milestone request/branch, and preserve the frozen product and privacy boundaries.
