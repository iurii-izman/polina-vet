# M8 + M9 production hardening and release runbook

This records the protected temporary release environments. It does not authorize a public launch, final-domain purchase, or content expansion.

## Architecture and hostnames

- Static staging: `polina-vet-staging` → `https://polina-vet-dev.aipipeline.cc`.
- Hosted editorial preview: `polina-vet-preview` → `https://preview-polina-vet.aipipeline.cc`.
- Self-hosted Sanity Studio: `polina-vet-studio` → `https://studio-polina-vet.aipipeline.cc`.
- Sanity remains the CMS. Workers Static Assets serves static builds; preview uses the Cloudflare Astro adapter and the existing draft/Visual Editing workflow.
- All three configs explicitly disable `workers_dev` and `preview_urls`. Exact custom domains and Access policies must be created only after a hostname conflict audit.

## Environment, SEO, and safety

`SITE_URL`, `SITE_INDEXABLE`, and `DEPLOYMENT_TARGET` are build configuration. Unknown targets are non-indexable; only `DEPLOYMENT_TARGET=production` together with `SITE_INDEXABLE=true` enables indexing. Staging, preview, local, Studio, empty RO/UK Knowledge, drafts, stale translations, withdrawn content, and invalid medical content remain noindex and are excluded from the sitemap.

Every rendered document emits one absolute self-canonical, contextual absolute hreflang links, `html lang`, robots metadata, and absolute social URLs. The root remains a redirect to `/ru/`. The sitemap is generated from valid core routes and discovery-eligible articles.

## Security and privacy

The static build carries `_headers` for CSP, MIME sniffing, referrer, permissions, and frame protections. Preview draft responses remain `private, no-store` and token-backed only on the server. `SANITY_API_READ_TOKEN` is a Worker secret for hosted preview; it must never be a GitHub variable, `PUBLIC_*` value, build log, or committed file. Cloudflare Access must protect each temporary custom domain with a narrowly scoped identity policy; never use an account-wide “protect all Workers” rule.

## Builds and CMS rebuilds

GitHub Actions remains the PR verification gate. Workers Builds should run: install from lockfile, `pnpm sanity:typegen`, `pnpm check`, `pnpm sanity:verify`, `pnpm preview:check`, static build, SEO/release validation, and hosted preview/Studio builds before deployment. A Sanity published-content webhook may invoke the staging Deploy Hook after the hook URL and burst/deduplication policy are configured in Cloudflare. Never put the hook URL in Git or this document.

Required account-level setup is manual: audit the three exact hostnames and unrelated `aipipeline.cc` records first; create only the three Workers/custom domains; configure per-Worker Access; add the exact Studio CORS origin; create one published-content webhook to the staging Deploy Hook; configure the preview Worker secret; connect Workers Builds to the repository. Do not modify apex, `www`, wildcard routes, zone-wide rules, unrelated Workers, or existing projects.

## Mandatory post-merge release gate

Before M10 starts, run the existing Sanity published-content webhook through the existing Cloudflare Deploy Hook after PR #8 is merged. Confirm that Cloudflare checks out the merged `main`, `pnpm release:validate` passes, the staging deployment succeeds, and `https://polina-vet-dev.aipipeline.cc` is verified while Access-protected and non-indexable. This is a mandatory post-merge smoke gate. A pre-merge build failure caused only by `main` not yet containing the PR's `release:validate` script is an expected branch dependency, not an application defect.

## Rollback and observability

In the staging Worker’s Deployments history, identify the last known-good version, roll back to it, verify HTTPS, Access, noindex, headers, sitemap, root redirect, and 404, then redeploy the intended version. Inspect Workers Build history, deployment versions, Worker logs, Access events, Sanity webhook delivery history, and GitHub CI. Never test rollback on the unrelated project.

## Future final-domain migration (M11 only)

On a later approved launch milestone: attach the final production Worker/domain, set `SITE_URL` and explicit production indexability, regenerate robots/sitemap/canonical/hreflang, move the CMS rebuild hook, run SEO/security/Lighthouse checks, and keep preview/Studio protected and the development hostname noindex. No frontend rewrite or content migration is required.

## Deferred

M10 Pre-launch Content Pack and M11 final domain, public indexing, Search Console, launch candidate, external red-team, and Launch v1.0 remain intentionally deferred.
