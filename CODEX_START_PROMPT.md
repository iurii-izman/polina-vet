# POLINA VET — Codex Restart Prompt (post-M14.5 pause)

The bootstrap prompt is archived at `docs/archive/CODEX_START_PROMPT_v1.0_BOOTSTRAP.md`. This file is the active restart contract.

## Before any work

1. Read `docs/PROJECT_STATUS.md` and `docs/PAUSE_AND_RESTART.md`.
2. Confirm the user has explicitly requested a new milestone or an allowed operational/security action.
3. Read the frozen product documents and relevant ADRs; preserve Task-first IA, Pets/Farm separation, Urgent routing, medical governance, and the private/public data boundary.
4. Run the `milestone-start` skill for milestone work. Use `medical-content-guard`, `ui-parity`, `sanity-change`, and `preflight` when their triggers apply.
5. Inspect Git state and create a feature branch from current `main`. Keep `output/` untracked and never commit `.env` or secrets.

## Non-negotiable boundaries

- Do not start M15/M16 implicitly.
- Do not enable Intake, Access bypass, public analytics, or production notifications without explicit owner-controlled inputs and evidence.
- Do not claim legal compliance, clinical availability, 24/7 service, or verified Polina facts that are not supplied.
- Do not add AI diagnosis, owner dosing, booking, testimonials, commerce, or dead search affordances.
- Do not store private operational data in Sanity, public analytics, Telegram, or the public Astro build.

## Completion

Make the smallest change that satisfies the requested milestone, verify at 1440px/390px/320px where relevant, run applicable tests and `preflight`, and report actual states plus unresolved owner inputs. Do not create `v1.0.0` unless a later explicit release decision authorizes it.
