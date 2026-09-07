# M14 Acceptance

This document records the historical M14 evidence before the later M14.5 closure action. The production migration statement below is retained as evidence from that M14 decision point; current production state is maintained in `PROJECT_STATUS.md`.

## Repository

- Baseline: `cbe799410b8c053ed1e3e6e160d02686088fbdd6`
- Branch: `feat/m14-veterinary-operations-core`
- PR/merge/head: created only after the gates below pass; update this line with the final values at commit/PR time
- Migration: `0002_m14_core`
- `output/` remains intentionally untracked.
- Staging Office Worker: `polina-vet-office-staging`, version `69960b59-b695-4921-89ae-a7adf714ecf1`
- Staging D1: `polina-vet-operations-staging` (`35f5c979-af99-4a1c-8fc9-98ab3e8ba96f`)

## Implemented locally

| Area | Evidence | State |
|---|---|---|
| Additive M14 migration | Local Wrangler migration applied successfully after M13 migration | PASS |
| Operations type-check | `pnpm --filter @polina-vet/operations check` | PASS |
| Office type-check | `pnpm --filter @polina-vet/office check` | PASS |
| Focused M14 tests | `pnpm test:m14`, 7 tests | PASS |
| Existing operations tests | `pnpm --filter @polina-vet/operations test`, 19 tests | PASS |
| `PUBLIC_INTAKE_ENABLED` | Existing intake Worker config remains `false` | PASS |
| Full repository check | `pnpm check`; all checks, 59-page public build, Studio build verification | PASS |
| Public E2E / visual regression | `pnpm test:e2e`; 100 tests passed, including 320/390/1440px checks | PASS |
| Public accessibility | `pnpm test:a11y`; 52 tests passed | PASS |
| Release validation | `pnpm release:validate`; six isolated Worker configs and 59 HTML SEO boundary checks | PASS |
| M14 validation hardening | Typed/bounded nested encounter input, bounded clinical PATCH, exact typed subject matching, repeated-completion guard, atomic encounter/clinical writes, POST-only global search, server-generated request IDs | PASS |
| Local isolated PET/FARM browser acceptance | Synthetic D1 Worker, test-only auth bypass, 390px flow; 320px and 1440px width checks | PASS (local only) |
| Local vaccination ledger acceptance | Individual FARM animal and FARM group vaccination records visible through Office actions | PASS (local only) |
| Local completed-record correction | Encounter/diagnosis correction produced versioned updates and audit field names without clinical values | PASS (local only) |
| Local stale-version conflict | Second PATCH with the same `recordVersion` returned 409 and emitted a `CONFLICT` audit event | PASS (local only) |
| Local M13 retention isolation | Deleting synthetic Inquiry left client/animal/encounter/diagnosis/medication and nulled `source_inquiry_id`; fixture cleaned | PASS (local only) |
| Codex Security final working-tree scan | Scan `46de6685-d574-4bae-9bcb-c54f9aafc0a1`; 0 reportable findings; runtime coverage limitation recorded because staging was not directly inspected by the scanner | PASS (0 findings) |
| Staging PET/FARM browser acceptance | Authenticated staging Office route; synthetic PET and FARM fixtures; create/edit/complete/follow-up/vaccination/search flows | PASS (staging) |
| Staging D1 migration and integrity | `0002_m14_core` applied remotely; subsequent migration list reports no pending migrations; FK check empty; final encounter/clinical versions both 5 | PASS (staging) |
| Production schema migration | Production migration list confirms `0002_m14_core` is pending and was not applied | NOT APPLIED (intentional) |
| Independent pre-PR red-team review | Aristotle review of current tree; 0 blockers, 0 majors, 0 reportable minors | PASS |

## Staging evidence

- Authenticated route: `https://office-polina-vet.aipipeline.cc/`.
- PET synthetic fixture: `M14 PET Synthetic`, identifier `M14-PET-20260906`; alert, completed `AT_SITE` encounter, diagnosis/medication/procedure, follow-up, and `Synthetic PET vaccine` recorded.
- FARM synthetic fixtures: holding `M14 FARM Synthetic 20260906`, group `M14 FARM Group Synthetic`, individual `M14 FARM Animal Synthetic`; completed `FIELD_VISIT` group encounter, population counts, diagnosis/medication/procedure, follow-up, `Synthetic FARM group vaccine`, and `Synthetic FARM animal vaccine` recorded.
- Final staging integrity counts: 2 synthetic patients, 1 holding, 1 group, 3 vaccinations, 2 follow-ups, and 7 audits for the known corrected encounter. Synthetic fixtures remain isolated in staging and contain no real PII.
- Global search was verified as HTTP POST with query text in the JSON body, not the URL; the response returned the synthetic PET fixture.

## Historical remaining release work

- Commit, push, create the PR, and merge only after the final preflight and repository checks remain green.
- Production migration was intentionally not part of the original M14 closure and required a separate explicit production-release decision. That later decision was made in the M14.5 closure brief; production now has `0002_m14_core` applied while remaining empty and fail-closed.
