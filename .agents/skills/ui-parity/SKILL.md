---
name: ui-parity
description: Use when changing layout, navigation, responsive CSS, page composition, cards, typography, article presentation, task routing, Urgent UI, or visual states.
---

# UI Parity

Protect parity with the frozen POLINA VET prototype. This skill is for implementation fidelity, not redesign.

## Sources of truth

Read the relevant sections of:

- `docs/POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html`
- `docs/Content & UX Freeze v1.0.md`
- `docs/POLINA_VET_Prototype_v1.2_Decision_Log.md`
- `docs/POLINA_VET_Prototype_Handoff_v1.2_CODEX_READY.md`

## Required verification

Check critical flows at 1440px, 390px, and 320px. Verify rendered behavior, not only source code. Do not require pixel-perfect screenshot diffs.

Confirm, where relevant:

- frozen homepage order and Task before biography;
- separate Pets and Farm journeys;
- globally discoverable Urgent, with `/urgent/` remaining router-only;
- generic sick-task routing does not auto-route to Urgent;
- prominent Farm multiple-sick action;
- contact limitations before contact methods;
- explicit affordances for clickable cards and no fake search;
- 44px primary touch targets, visible keyboard focus, usable mobile navigation, and desktop language keyboard behavior;
- no horizontal overflow and support for reduced motion;
- conditional Seasonal, Clinical Case, and search states disappear or appear correctly;
- optional photography, missing/stale/withdrawn content states, and factual/medical placeholders remain honest.

## Browser tooling roles

- The official Playwright Codex skill is for agent-driven browser exploration and flow verification.
- Chrome DevTools MCP is for interactive inspection, debugging, performance, and accessibility checks.
- `@playwright/test` is for deterministic CI regression.

Do not install a second browser MCP or replace project Playwright tests with exploratory tooling.
