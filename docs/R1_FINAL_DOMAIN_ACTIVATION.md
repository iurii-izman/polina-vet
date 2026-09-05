# R1 — Final Domain & Public Launch Activation

Status:
WAITING FOR DOMAIN OWNERSHIP

Preferred final domain:
lina.vet

Current temporary production:
https://lina.aipipeline.cc

Temporary state:
PUBLIC + NOINDEX

Blocks:
- public indexability
- Search Console
- organic SEO launch
- v1.0.0

Does NOT block:
- M12
- M13
- M14
- M15
- M16
- M17
- M18
- continued content/editorial work
- analytics/measurement preparation
- CRM/operations development

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
19. Create `v1.0.0`.

## Critical invariant

Never leave both `lina.aipipeline.cc` and `lina.vet` independently indexable.
