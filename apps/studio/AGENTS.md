# apps/studio — Sanity Studio instructions

Scope: schemas, Studio structure, editorial validation, localization, preview integration.

## Rules
- Follow `docs/ARCHITECTURE.md`, `docs/MEDICAL_SAFETY.md`, and the `sanity-change` skill.
- Use official Sanity docs/MCP for current APIs.
- Prefer generated types via Sanity TypeGen.
- Do not use Sanity `_rev` as medical revision.
- Long-form medical translations are separate documents.
- Translation family/lineage must be explicit.
- `primaryDomain` controls canonical product ownership.
- Store facts and derive review/translation states where possible.
- Reviewer is risk-based, not mandatory ceremonial metadata.
- Do not model future commerce/booking systems until implemented.

## Content safety
- Do not store private patient/client records in the public CMS.
- Clinical case consent artifacts remain outside public CMS.
- Do not publish medical documents lacking the required governance fields for their risk level.
- Never delete datasets or bulk-delete documents without explicit approval.
