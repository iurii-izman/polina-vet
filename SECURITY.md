# Security

POLINA VET is a private repository and product, not an open-source vulnerability disclosure program.

## Reporting

Report security concerns privately to the repository owner through the repository's private GitHub channel. Do not open a public issue for a vulnerability and do not include secrets, tokens, credentials, or real client/patient data.

## Data handling

- Never commit API keys, Cloudflare or Sanity credentials, Telegram tokens, cookies, JWTs, private keys, database exports, or production logs.
- Never put real client, patient, holding, or clinical data in GitHub issues, pull requests, screenshots, or repository files.
- Do not disclose sensitive vulnerability details publicly before remediation and credential rotation are complete.

## Current baseline

The final application security hardening baseline reported 0 reportable application findings. The production Office is active, Access-protected, and fail-closed with `OFFICE_AUTH_BYPASS=false`; public Intake is active under the owner-authorized technical launch decision. Article 22 evidence remains pending and is not represented as legal compliance.

Transitive dependency advisories are tracked separately in [R4](docs/R4_UPSTREAM_DEPENDENCY_SECURITY_MAINTENANCE.md). Re-run the production audit after dependency changes and prefer compatible upstream remediation over broad or unreviewed overrides.

## Credential response

If a credential may have been exposed, stop using it, rotate it through the owning provider's secret-management controls, preserve only safe evidence, and record the incident privately. Never paste the replacement credential into chat, GitHub, or source files.
