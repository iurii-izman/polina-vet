# M13 External Activation Inputs

The implementation intentionally does not invent or print owner-controlled values. This checkpoint resolves the infrastructure that can be created safely with the available Cloudflare account access while keeping public intake inactive until the current PMR privacy prerequisite is evidenced.

## Already resolved

- Empty staging D1 `polina-vet-operations-staging` (`35f5c979-af99-4a1c-8fc9-98ab3e8ba96f`) exists in EEUR and has `0001_init` applied.
- Empty production D1 `polina-vet-operations-production` (`cd40444f-879d-4c50-af6a-a031ea693f9a`) exists in EEUR and has `0001_init` applied. Production Workers remain fail-closed until the activation prerequisite is evidenced.
- Staging Workers are deployed with fail-closed settings:
  - `polina-vet-intake-staging` at `intake-polina-vet.aipipeline.cc`;
  - `polina-vet-office-staging` with its configured custom-domain route.
- Intake native Rate Limiting is configured as `INTAKE_RATE_LIMITER`, 5 requests per 60 seconds, namespace `1001`, for base, staging, and production configurations.
- Staging Turnstile widget `polina-vet-intake-staging` exists for `polina-vet-dev.aipipeline.cc`; sitekey `0x4AAAAAAEpk3wwLuo-XJBLf`; its secret is not stored in Git.
- The staging Office custom hostname is protected by Cloudflare Access; authorized access, Access JWT validation, and the Office workflow were verified.
- Staging Telegram secrets are configured outside Git; the real adapter delivered a staging notification with the allowed reference, context, locality, and protected Office link.
- A real browser intake smoke using Turnstile reached staging D1 and was cleaned up; staging was restored to `PUBLIC_INTAKE_ENABLED=false`.

## External prerequisite still open

- Submit the Article 22 operator notification to the PMR authorized body before public Intake is enabled, then retain the submission/registration evidence with the release record. The current public flow is a pre-contract inquiry and no Article 22 exception clearly covers it. See `docs/M13_PMR_PRIVACY_CHECK.md`.
- After that evidence exists, set the production Turnstile secret and any optional Telegram secret outside Git, confirm the final hostname/origin allowlist, and run the authorized production smoke-and-cleanup sequence.

## Optional

- Production Telegram notifications remain optional and activation-gated; staging Telegram delivery is already verified.

## Resolved in M13

- Canonical public privacy notice `Version 1.0 · approved 6 Sept 2026` is implemented at `/ru/privacy/v1.0/`, `/ro/privacy/v1.0/`, and `/uk/privacy/v1.0/`.
- Intake consent is required, non-prechecked, versioned as `1.0`, and timestamped by the Intake Worker.
- Production D1 schema parity is verified; production worker configuration remains `PUBLIC_INTAKE_ENABLED=false`.
- Fail-closed production deployments are present: Intake version `6c5785c4-5234-41a9-9de4-b73386947820` and Office version `54d92ce9-2fcf-488b-a36d-706dfb5c9727`. Intake health is reachable, writes return 404 while disabled, and unauthenticated Office access returns 401.
- The static production site was updated at `lina.aipipeline.cc`; its temporary `X-Robots-Tag: noindex, nofollow, noarchive` boundary and production Intake CSP origin were verified.
- Production Intake has no Worker secrets yet. Production Access variables are intentionally blank, so Office remains fail-closed until the Access application/team domain/audience and the two approved identities are configured through Cloudflare controls.

Do not paste secrets into GitHub, this repository, or the PR body.
