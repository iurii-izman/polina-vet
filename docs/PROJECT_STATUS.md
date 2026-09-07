# POLINA VET — Current Project Status

**As of:** 2026-09-07  
**Lifecycle:** M1–M14.5 closure baseline; development paused for real-world observation  
**Current branch:** `chore/finalize-m14-5-pause-baseline` until closure merge

## Launch decision

The public static site is launched on the temporary production origin `https://lina.aipipeline.cc`. The temporary origin is permitted to be indexable for this launch baseline when the production build is made with `SITE_URL=https://lina.aipipeline.cc`, `SITE_INDEXABLE=true`, and `DEPLOYMENT_TARGET=production`, and the live origin verifier passes. It is not the permanent SEO identity.

This launch does not claim legal compliance, clinical availability, 24/7 coverage, or that Intake is active. `v1.0.0` is intentionally not created.

## Runtime state

| Area | State | Evidence / boundary |
| --- | --- | --- |
| Public web | LIVE on temporary origin | Static Cloudflare Worker `polina-vet-production`; canonical/OG/sitemap/alternate hosts are generated from the explicit origin. |
| Public indexability | ENABLED only on the verified production build | Preview, staging, local, and explicit non-indexable builds remain blocked by `robots.txt` and page metadata. |
| Public analytics | OFF | No verified owner-controlled Plausible domain/configuration. |
| Production D1 | PROVISIONED and migrated | `polina-vet-operations-production`; `0001` and `0002_m14_core` applied; zero inquiry, clinical, and audit rows; foreign-key check clean. |
| Office Worker | DEPLOYED FAIL-CLOSED / NOT OPERATIONAL | `OFFICE_AUTH_BYPASS=false`; no production Access application or approved identity set is configured. |
| Intake Worker | DEPLOYED DISABLED | `PUBLIC_INTAKE_ENABLED=false`; no real public processing or production smoke is authorized. |
| Turnstile | CONFIGURED | Production widget is scoped to `lina.aipipeline.cc`; secret is stored in Worker secret storage and is never committed or printed. |
| Telegram | NOT CONFIGURED in production | No production bot/chat credentials were supplied. Failure must never expose PII or block a future database write. |
| Private learning telemetry | CONFIGURED / REAL OBSERVATION NOT YET STARTED | Production dataset is separate from public analytics. Synthetic events do not start the clock. |
| Sanity | VERIFIED | Published editorial verification passed; no private operational data is stored in Sanity. |

## Open external follow-ups

- **R1:** verify ownership and migrate the public canonical identity to `lina.vet`; then re-run SEO, redirect, Search Console, and sitemap checks. Never leave both origins independently indexable.
- **R2:** provide and verify owner-controlled external channels and, separately, any Plausible site/domain configuration. Keep public analytics off until explicit configuration exists.
- **R3:** complete production Access, approved identities, Telegram configuration, and the Article 22 evidence gate before enabling real Intake. See `R3_PRODUCTION_COMPLIANCE_AND_INTAKE.md`.

The owner-approved launch override is: **launch accepted with notification evidence deferred**. This records an operational decision; it does not convert the PMR gate into a pass or authorize real Intake processing.

## Intentionally unresolved facts

Polina's full name/title/employer wording, contacts, geography, availability, education, real cases, reviewed red-flag wording, final RO/Moldavian policy wording, legal status, permanent domain ownership, external channels, production Access identities, Telegram credentials, and Article 22 route/filing evidence remain owner-supplied or externally verified inputs.

## Restart rule

Any new implementation work must first follow `PAUSE_AND_RESTART.md`, create a new milestone request/branch, and preserve the frozen product and privacy boundaries.
