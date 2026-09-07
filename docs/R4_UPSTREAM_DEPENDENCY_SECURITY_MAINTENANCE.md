# R4 — Upstream Dependency Security Maintenance

Status: open external maintenance gate

Tracking issue: [#23](https://github.com/iurii-izman/polina-vet/issues/23)

## Scope

The final security hardening audit retains six production dependency advisories in transitive Sanity/Vercel tooling paths. The affected packages are not part of the public runtime bundle, but they remain in the production dependency graph and require an upstream-compatible remediation.

## Current dependency paths

- `@sanity/cli` → `@sanity/server` → `@vercel/frameworks@3.29.0` → `js-yaml@3.13.1`
- `@sanity/cli` → `@sanity/server` → `@vercel/frameworks@3.29.0` → `smol-toml@1.5.2`
- `@sanity/cli` → `@sanity/server` → `typeid-js@1.2.0` → `uuid@10.0.0`

## Audit evidence

As of 2026-09-07, `pnpm audit --prod --audit-level=moderate` reports four `js-yaml` advisories, one `smol-toml` advisory, and one `uuid` advisory. The latest compatible `@vercel/frameworks` release checked still declares the vulnerable `js-yaml` and `smol-toml` versions, and `typeid-js` still declares `uuid^10.0.0`.

## Follow-up

1. Re-run the production audit after each Sanity/Vercel dependency update.
2. Prefer upstream releases or a narrowly scoped, compatibility-tested transitive remediation.
3. Do not apply a broad major upgrade or unreviewed override solely to make the audit output green.
4. Close this document and issue only with fresh audit output and build/type/test verification.

No secrets, tokens, or patient/client data are recorded here.
