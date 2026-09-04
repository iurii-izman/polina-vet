# POLINA VET M11 launch candidate

Status date: 2026-09-04  
Base SHA: `18ac4357c7d1384fca4169707a24120fd47e9a3d`  
Candidate branch: `feat/launch-candidate-m11`  
Candidate SHA: `3440ee4`  
M11 PR: [#10](https://github.com/iurii-izman/polina-vet/pull/10)  
Planned final domain / canonical hostname: `lina.md` (not purchased or verified)

## Verdict

**M11 LAUNCH CANDIDATE READY: YES, domain-independent work only**  
**FINAL DOMAIN GATE: WAITING**  
**Production launch: NO-GO until the approved domain and deployed-origin gates are complete.**

## Content and safety

- Public medical corpus: RU 6, RO 0, UK 0.
- Remaining M10 drafts: 42 (RU 14, RO 14, UK 14; 21 HIGH and 21 STANDARD document instances).
- QA drafts: 0. Clinical cases: 0.
- Urgent router, Pets/Farm separation, contact boundaries, and no-fake-facts policy are preserved.
- No new medical publication or commercial/tracking surface is introduced.

## Environment map

| Environment | Host / behavior |
|---|---|
| Staging | `polina-vet-dev.aipipeline.cc`, protected and non-indexable |
| Preview | `preview-polina-vet.aipipeline.cc`, protected draft perspective |
| Studio | `studio-polina-vet.aipipeline.cc`, protected editorial UI |
| Production | Final approved domain required; published perspective only; indexability fail-closed |

## Audit and verification

- Content policy and M10 validation: PASS.
- Astro diagnostics: PASS (0 errors, warnings, hints).
- Unit tests: PASS (25 tests).
- Cloudflare configuration validation: PASS (4 isolated configs, including the prepared production Worker).
- Local TypeGen/build: blocked by the known hang after schema extraction; CI evidence is required.
- Deployed candidate draft isolation, Lighthouse, external a11y/security headers, Cloudflare, Sonar, and Search Console: pending deployment/domain access.

## SEO and release controls

The repository preserves the rule that indexability requires both `SITE_INDEXABLE=true` and `DEPLOYMENT_TARGET=production`. Staging and preview remain non-indexable. Final-domain canonical, hreflang, robots, sitemap, OG URLs, HTTPS, and cache behavior must be verified after the domain is supplied and while indexability is still off.

## Rollback and monitoring

Use Cloudflare deployment history to roll back the POLINA VET production Worker to the last known-good version, then verify HTTPS, headers, canonical, robots, sitemap, root redirect, 404, and draft isolation. Monitor GitHub CI, Workers Builds/logs, Access events, DNS/SSL, and Sanity webhook/rebuild delivery for build failure, domain failure, unexpected noindex, or draft exposure.

## Required user action

Purchase/control `lina.md`, confirm that the apex is the canonical hostname (or explicitly choose `www`), and provide access needed to verify the Cloudflare zone and Google Search Console property. No domain will be purchased or modified automatically.
