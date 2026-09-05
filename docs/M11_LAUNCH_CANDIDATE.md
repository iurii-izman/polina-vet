# POLINA VET M11 launch candidate

Status date: 2026-09-05
Base SHA: `18ac4357c7d1384fca4169707a24120fd47e9a3d`  
Candidate branch: `feat/launch-candidate-m11`  
Candidate source: final Git HEAD on `feat/launch-candidate-m11`
M11 PR: [#10](https://github.com/iurii-izman/polina-vet/pull/10)  
Temporary launch candidate: `https://lina.aipipeline.cc` (public + noindex)  
Preferred future final domain: `lina.vet` — NOT YET OWNED  
Final domain status: **WAITING**  
The former provisional `lina.md` is abandoned; do not purchase or deploy it.

## Verdict

**M11 TEMPORARY LAUNCH CANDIDATE READY: YES**
**Temporary production:** public + noindex at `https://lina.aipipeline.cc`
**FINAL DOMAIN GATE:** waiting for purchase/control of `lina.vet`
**M12:** not started.

## M11.5 deployed evidence

- Worker: `polina-vet-production`.
- Current version: `ca66a2ff-93be-4424-b9f0-f06f2b00f3c0`.
- HTTPS/public access: PASS. Staging, Preview, and Studio remain Cloudflare Access protected.
- Live origin verifier: PASS (`routes=51`, `sitemapRoutes=48`, `draftIsolation=PASS`, `indexable=false`).
- Live headers: CSP, Referrer-Policy, X-Content-Type-Options, X-Robots-Tag, and Permissions-Policy present.
- Live Lighthouse representative homes: Performance 100, Accessibility 100, Best Practices 100; LCP 1.2–1.3s; CLS 0. SEO remains intentionally reduced by noindex.
- Production is static-assets-only and published-perspective-only; no Viewer token, preview secret, Visual Editing runtime, credentials, or private data is bundled.
- M10 deferred draft isolation: **CLOSED / PASS**. The selected draft remains absent from Knowledge, Pets discovery, direct public route content, and sitemap; current remote state remains draft-only.
- `lina.md` is abandoned and appears only in the historical note below.

## Release path and rollback

`feat/launch-candidate-m11` source → `pnpm release:validate` → production web build with `SITE_URL=https://lina.aipipeline.cc`, `SITE_INDEXABLE=false`, `DEPLOYMENT_TARGET=production` → `pnpm exec wrangler deploy --config apps/web/wrangler.production.jsonc`.

Current known-good version is `ca66a2ff-93be-4424-b9f0-f06f2b00f3c0`. Roll back in Cloudflare Workers deployment history for `polina-vet-production` to the previous known-good version, then rerun HTTPS, headers, canonical/robots/sitemap, root/404, and draft-isolation verification.

## Final-domain activation runbook

1. Purchase `lina.vet` and configure its Cloudflare zone.
2. Move the production custom domain from `lina.aipipeline.cc` to `lina.vet`.
3. Rebuild with `SITE_URL=https://lina.vet`, `SITE_INDEXABLE=false`, `DEPLOYMENT_TARGET=production`.
4. Deploy and run `verify:origin` against `lina.vet`; repeat draft isolation and smoke/Lighthouse checks.
5. Set `SITE_INDEXABLE=true`, rebuild, and redeploy.
6. Verify robots, X-Robots-Tag, canonical, hreflang, sitemap, cache, and post-launch routes.
7. Configure Google Search Console, submit the sitemap, run post-launch smoke, and create the `v1.0.0` tag.

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
| Production | `https://lina.aipipeline.cc` — temporary public launch candidate, published perspective only, PUBLIC + NOINDEX |

Future final production hostname: `lina.vet` — not yet owned.

## Audit and verification

- Content policy and M10 validation: PASS.
- Astro diagnostics: PASS (0 errors, warnings, hints).
- Unit tests: PASS (25 tests).
- Cloudflare configuration validation: PASS (4 isolated configs, including the prepared production Worker).
- TypeGen had intermittent local hangs during earlier M10/M11 work, but the final M11.5 validation completed successfully locally and in CI.
- Deployed candidate draft isolation, Lighthouse, external a11y/security headers, Cloudflare, and Sonar: PASS. Search Console remains intentionally pending until `lina.vet` is owned and indexability is enabled.

## SEO and release controls

The repository preserves the rule that indexability requires both `SITE_INDEXABLE=true` and `DEPLOYMENT_TARGET=production`. Staging and preview remain non-indexable. The temporary candidate's canonical, hreflang, robots, sitemap, OG URLs, HTTPS, and cache behavior were verified while indexability remains off; repeat the same checks after the final hostname is supplied.

## Rollback and monitoring

Use Cloudflare deployment history to roll back the POLINA VET production Worker to the last known-good version, then verify HTTPS, headers, canonical, robots, sitemap, root redirect, 404, and draft isolation. Monitor GitHub CI, Workers Builds/logs, Access events, DNS/SSL, and Sanity webhook/rebuild delivery for build failure, domain failure, unexpected noindex, or draft exposure.

## Required user action

Future activation requires owner purchase/control of `lina.vet`. No domain purchase, indexing, Search Console submission, or v1.0.0 tag is authorized in M11.5. The temporary candidate does not depend on owning the final domain.
