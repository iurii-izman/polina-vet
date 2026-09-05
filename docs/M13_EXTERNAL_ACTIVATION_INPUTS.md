# M13 External Activation Inputs

The implementation intentionally does not invent or print owner-controlled values. This checkpoint resolves the infrastructure that can be created safely with the available Cloudflare account access while keeping public intake and production Workers inactive.

## Already resolved

- Empty staging D1 `polina-vet-operations-staging` (`35f5c979-af99-4a1c-8fc9-98ab3e8ba96f`) exists in EEUR and has `0001_init` applied.
- Empty production D1 `polina-vet-operations-production` (`cd40444f-879d-4c50-af6a-a031ea693f9a`) exists in EEUR and has `0001_init` applied. It has not been bound to a deployed production Worker.
- Staging Workers are deployed with fail-closed settings:
  - `polina-vet-intake-staging` at `intake-polina-vet.aipipeline.cc`;
  - `polina-vet-office-staging` with its configured custom-domain route.
- Intake native Rate Limiting is configured as `INTAKE_RATE_LIMITER`, 5 requests per 60 seconds, namespace `1001`, for base, staging, and production configurations.
- Staging Turnstile widget `polina-vet-intake-staging` exists for `polina-vet-dev.aipipeline.cc`; sitekey `0x4AAAAAAEpk3wwLuo-XJBLf`; its secret is not stored in Git.

## Owner input still required

- Cloudflare Access team domain and Office application audience; Wrangler does not provide an Access application/policy command, and the authenticated token has no Access-management scope.
- Attach the two owner-supplied Access identities to that protected Office application. Their email values are intentionally not stored in this repository.
- Approved, versioned privacy notice replacing `M13_PRIVACY_NOTICE_DRAFT.md`.
- Production Turnstile widget/sitekey/secret and final hostname allowlist.
- Verification of the staging Office DNS/custom-domain route, which did not resolve during this checkpoint; the Worker deployment itself succeeded.
- Verified final staging/production hostnames and allowlisted origins.

## Optional

- Telegram notifications: configure only if desired. The adapter remains disabled until its secrets exist.

Do not paste secrets into GitHub, this repository, or the PR body.
