---
name: preflight
description: Use at the end of an implementation task before claiming it is complete, before opening a PR, or before asking for merge.
---

# Preflight

Run the smallest complete verification set appropriate to the change.

## Always
- inspect `git diff`;
- confirm no secrets/private data;
- confirm frozen product decisions were not unintentionally changed;
- run formatting/lint/type/build checks available through `pnpm check`.

## UI changes
- verify rendered behavior, not only source;
- check 1440px, 390px, and 320px where relevant;
- keyboard navigation/focus;
- no horizontal overflow;
- 44px primary touch targets;
- no dead/fake affordance;
- preserve Urgent visibility and Pets/Farm distinction.

## Medical/content changes
Use `medical-content-guard`.

## Sanity changes
Use `sanity-change`, regenerate/verify types, and report migration impact.

## Before PR
Run the relevant:
- `pnpm check`
- `pnpm test:e2e`
- `pnpm test:a11y`
- visual checks if configured

If a command cannot run because setup is incomplete, do not pretend success. Report the missing prerequisite.
