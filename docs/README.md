# POLINA VET — Documentation Index

## Canonical product documents

These files are active sources of truth:

1. `PROJECT_STATUS.md` — current operational and release truth.
2. `PAUSE_AND_RESTART.md` — development pause and restart gate.
3. `Product Blueprint v1.1.md`
4. `Content & UX Freeze v1.0.md`
5. `POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html`
6. `POLINA_VET_Prototype_v1.2_Decision_Log.md`
7. `POLINA_VET_Prototype_Handoff_v1.2_CODEX_READY.md`

## Engineering documents

- `ARCHITECTURE.md`
- `MEDICAL_SAFETY.md`
- `TOOLING_WINDOWS.md`
- `FUTURE_ARCHITECTURE_GUARDRAILS.md` — durable boundaries for future operational and automation architecture.
- `OPERATIONS_RUNBOOK.md` — current Cloudflare, D1, Access, Intake, notification, and recovery procedures.
- `R3_PRODUCTION_COMPLIANCE_AND_INTAKE.md` — deferred Intake and Article 22 evidence gate.
- `R3_ARTICLE_22_NOTIFICATION_PACKAGE.md` — internal owner-input checklist; not a filing.
- `BACKUP_RECOVERY.md` — current production backup and recovery guidance.
- `ADR/`

## Archive

Superseded review/handoff documents belong in `docs/archive/`, including:
- `POLINA_VET_Prototype_v1.0_RedTeam_Findings.md`
- `POLINA_VET_Prototype_Handoff_v1.1.md`
- older prototype versions if retained.

Codex must not treat archived files as current requirements.

The former bootstrap prompt is retained at `archive/CODEX_START_PROMPT_v1.0_BOOTSTRAP.md`. The active restart prompt is the root `CODEX_START_PROMPT.md`.

## Important

Do not rename or rewrite frozen product documents during normal implementation work.
If a product decision changes, create a new decision/ADR rather than silently editing history.
