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
- The staging Office custom hostname is protected by Cloudflare Access; authorized access, Access JWT validation, and the Office workflow were verified.
- Staging Telegram secrets are configured outside Git; the real adapter delivered a staging notification with the allowed reference, context, locality, and protected Office link.
- A real browser intake smoke using Turnstile reached staging D1 and was cleaned up; staging was restored to `PUBLIC_INTAKE_ENABLED=false`.

## Owner input still required

- Approved, versioned privacy notice replacing `M13_PRIVACY_NOTICE_DRAFT.md`.
- Final controller/operator identity, legal-basis, rights, privacy-contact, and retention wording where legally required.
- Production Turnstile widget/sitekey/secret and final hostname allowlist.
- Verified final production hostnames and allowlisted origins.

## Optional

- Production Telegram notifications remain optional and activation-gated; staging Telegram delivery is already verified.

Do not paste secrets into GitHub, this repository, or the PR body.
