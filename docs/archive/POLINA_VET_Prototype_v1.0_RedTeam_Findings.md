# POLINA VET — Prototype v1.0 Red-Team Findings

## Verdict
Prototype v1.0 correctly preserves the product architecture, but it was not ready to be used as the final Codex implementation contract. It functioned more as an interactive high-fidelity wireframe.

## Must-fix items found
1. Mobile navigation disappeared below 850px.
2. Language selector was absent from the actual global header.
3. Mobile hero placed the placeholder photo before H1/action, violating Content & UX Freeze.
4. Homepage `Животное заболело` incorrectly routed to Urgent.
5. Homepage `Подготовиться к обращению` incorrectly routed only to the pet checklist.
6. Frozen homepage blocks `Как готовятся материалы` / `Полезные материалы` were omitted.
7. Required prototype states were missing: published RO, seasonal hidden, case enabled/hidden behavior.
8. Before Vet Arrives had no Contact next step.
9. About had no strong materials/contact next step.
10. Urgent flow still too directly implied `red flags → contact Polina`.
11. Pets/Farm had almost identical visual grammar.
12. Muted text color was borderline below WCAG AA for small normal text on the warm background.
13. Skip link, active navigation state, and explicit focus styling were absent.
14. Mobile header urgent target was below the project's 44px target.
15. Footer navigation was not clickable.

## v1.1 red-team patch
The accompanying v1.1 file fixes these implementation deviations without changing Product Blueprint v1.1 or Content & UX Freeze v1.0.

## Remaining open items
- Actual Polina photography
- Final typeface selection / typographic tuning
- Real biographical and contact facts
- Real clinical case
- Final medical review of urgent and symptom wording
- Legal copy
- Final Romanian/Moldavian language policy
- Independent visual judgement after screenshots are available

## Recommendation
Run one independent multimodal visual/UX review on v1.1, not on v1.0. Then freeze Prototype v1.2 and hand it to Codex for Astro + Sanity implementation.
