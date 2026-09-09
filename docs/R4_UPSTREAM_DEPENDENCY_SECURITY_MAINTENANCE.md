# R4 — Upstream Dependency Security Maintenance

Status: open external maintenance gate

Tracking issue: [#23](https://github.com/iurii-izman/polina-vet/issues/23)

## Scope

The 2026-09-09 production audit reports nine dependency advisories: four high and five moderate. They remain transitive through Sanity/Vercel tooling and Astro/Cloudflare build tooling; the affected packages are not part of the public runtime bundle, but they remain in the production dependency graph and require compatible remediation.

## Current dependency paths

- `@sanity/cli` → `@vercel/frameworks` → `js-yaml` (four advisories: one moderate, three high)
- `@sanity/cli` → `@vercel/frameworks` → `smol-toml` (one moderate)
- `@sanity/cli` → `typeid-js` → `uuid` (one moderate)
- `@astrojs/cloudflare` → `@cloudflare/vite-plugin` → `miniflare` → `sharp` (one high)
- `@sanity/cli` → `@sanity/cli-build` → `@module-federation/dts-plugin` → `adm-zip` (one moderate)

## Audit evidence

As of 2026-09-09, `pnpm audit --prod --audit-level=moderate` reports 9 vulnerabilities (4 high, 5 moderate): four `js-yaml`, one `smol-toml`, one `uuid`, one `sharp`, and one `adm-zip` advisory. The current paths are transitive and no compatible remediation has been verified during this freeze review.

## Follow-up

1. Re-run the production audit after each Sanity/Vercel dependency update.
2. Prefer upstream releases or a narrowly scoped, compatibility-tested transitive remediation.
3. Do not apply a broad major upgrade or unreviewed override solely to make the audit output green.
4. Close this document and issue only with fresh audit output and build/type/test verification.

No secrets, tokens, or patient/client data are recorded here.
