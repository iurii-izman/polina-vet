# R1 — Migrate public production to lina.vet and complete permanent SEO identity

Status: OPEN / PERMANENT DOMAIN OWNERSHIP NOT VERIFIED

Preferred final domain:
lina.vet

Current temporary production:
https://lina.aipipeline.cc

Temporary state: PUBLIC production on `https://lina.aipipeline.cc`; indexability is controlled by the explicit production build flags and must be verified after every deploy.

Does not block the public launch baseline. It blocks the permanent domain migration, canonical identity, and Search Console submission.

Does NOT authorize M15/M16 or any new development during the pause.

## Activation checklist

1. Purchase/control `lina.vet`.
2. Add/configure Cloudflare zone.
3. Configure DNS/SSL.
4. Move `polina-vet-production` custom hostname from `lina.aipipeline.cc` to `lina.vet`.
5. Build with `SITE_URL=https://lina.vet`, `SITE_INDEXABLE=false`, `DEPLOYMENT_TARGET=production`.
6. Deploy.
7. Run live origin verifier.
8. Repeat draft isolation.
9. Verify HTTPS, canonical, hreflang, OG, sitemap, robots, X-Robots-Tag, cache, and security headers.
10. Run production smoke.
11. Run Lighthouse.
12. Only after all checks pass: `SITE_INDEXABLE=true`.
13. Rebuild/redeploy.
14. Verify indexability again.
15. Configure Google Search Console.
16. Submit sitemap.
17. Run post-launch smoke.
18. Decide temporary origin fate: 301 to `lina.vet` if shared externally, or retire the route if unused.
19. Keep the repository version/tag policy unchanged; the M14.5 pause tag is the only release tag authorized by the closure brief.

## Critical invariant

Never leave both `lina.aipipeline.cc` and `lina.vet` independently indexable.

## Current verification

The temporary origin has a corrected self-consistent canonical, hreflang, Open Graph, robots, and sitemap set. Search Console was not configured because permanent `lina.vet` ownership was not verified. The temporary origin must be redirected or retired when R1 is completed.
