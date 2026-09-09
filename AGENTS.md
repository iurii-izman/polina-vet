# POLINA VET — Repository Instructions for Codex

## Mission

Implement POLINA VET as the frozen Veterinary Guidance & Routing Hub defined by the canonical product documents in `docs/`.

Codex is an implementation engineer here. Do not redesign the product, reopen the information architecture, or invent missing facts.

The M1–M14.5 implementation and launch baseline is now closed. Development is frozen for real-world observation. Read `docs/PROJECT_STATUS.md` and `docs/PAUSE_AND_RESTART.md` before changing the repository. Do not start M15, M16, or any later milestone without an explicit new owner request.

## Required current-work read order

1. `docs/PROJECT_STATUS.md`
2. `docs/PAUSE_AND_RESTART.md`
3. `docs/ARCHITECTURE.md`
4. relevant current R1–R4 documents and ADRs
5. frozen product documents where the requested work touches product behavior

## Canonical sources of truth

Read these before meaningful implementation work, in this order:

1. `docs/PROJECT_STATUS.md`
2. `docs/PAUSE_AND_RESTART.md`
3. `docs/Product Blueprint v1.1.md`
4. `docs/Content & UX Freeze v1.0.md`
5. `docs/POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html`
6. `docs/POLINA_VET_Prototype_v1.2_Decision_Log.md`
7. `docs/POLINA_VET_Prototype_Handoff_v1.2_CODEX_READY.md`
8. `docs/ARCHITECTURE.md`
9. `docs/MEDICAL_SAFETY.md`
10. relevant ADRs in `docs/ADR/`

If two documents appear to conflict, do not guess. Prefer the later frozen decision document, record the conflict, and ask before changing product behavior.

## Frozen product decisions

Do not reopen these without explicit user approval:

- Task before biography.
- Pets and Farm are separate product verticals.
- Global `/urgent/` is a router, not a third medical article.
- Urgent navigation does not imply Polina is available 24/7.
- Polina is a trust/author layer, not a vanity hero.
- Commercial/service layer is off for MVP.
- No AI diagnosis, symptom checker, owner-facing dose calculator, ratings/testimonials, fake availability, or invented claims.
- Public production is static-first Astro.
- Sanity owns structured editorial content.
- Medical long-form translations are separate documents linked by a stable translation family.
- `medicalRevision` is separate from Sanity `_rev`.
- Missing/stale translations are explicit; no silent medical fallback.
- High-risk stale/withdrawn content must not end in a naked 404.
- Seasonal and Clinical Case sections disappear fully when there is no valid content.

## Factual placeholders

Never invent:

- Polina's surname;
- exact professional title;
- employer wording;
- phone/messengers;
- service area;
- availability;
- education/certificates;
- real clinical cases;
- legal status/claims;
- medical red-flag wording that is marked as requiring review.

Keep placeholders visible in development data until verified input is provided.

## Medical safety

For any task that changes medical content, urgent copy, medical schemas, translation freshness, content validation, clinical cases, or source/review metadata, use the `medical-content-guard` skill.

Do not introduce owner-facing medication doses or treatment protocols unless explicitly requested and reviewed outside the public-site MVP scope.

## Documentation freshness

For library/framework/API/CLI syntax or configuration:
- use Context7 when available;
- use official documentation for Astro, Sanity, Playwright, TypeScript, and other dependencies;
- do not rely on remembered APIs when current docs can be checked.

For Sanity work:
- use the official Sanity MCP/Agent Toolkit when available;
- inspect schemas before querying or mutating content;
- never delete datasets/documents or perform destructive migrations without explicit approval.

For browser/UI verification:
- use Chrome DevTools MCP when available;
- verify rendered behavior, not only source code.

## Engineering principles

- Prefer the simplest architecture that satisfies the frozen product.
- Do not add infrastructure “for later” without a current requirement.
- Keep client-side JavaScript minimal.
- Accessibility target: WCAG 2.2 AA.
- Primary touch targets: at least 44px.
- Mobile utility is more important than desktop spectacle.
- Low-bandwidth performance is a first-class constraint.
- Use TypeScript strict mode.
- Generate Sanity-derived types; do not maintain duplicate handwritten CMS types when TypeGen can generate them.
- Store facts; derive editorial/review states.
- Policy as code is preferred over reminders in prose.

## Git and safety

- Never commit secrets, tokens, API keys, `.env` contents, or private patient/client data.
- Never `git push --force`.
- Never `git reset --hard` on user work.
- Never delete a Sanity dataset.
- Never deploy production or change repository visibility without explicit approval. The final M1–M14.5 closure brief is that approval for the recorded launch actions; later production changes still require explicit approval.
- After the bootstrap baseline, use feature branches and PRs rather than direct changes to `main`.
- Keep commits small and descriptive.

## Required checks

Before starting a milestone or major feature, use the `milestone-start` skill.

For UI, layout, or responsive changes, use the `ui-parity` skill.

Recommended lifecycle: `milestone-start` → implementation → domain-specific skill → `preflight`.

Before declaring a coding task complete:
1. run the `preflight` skill;
2. run the relevant `pnpm` checks;
3. verify critical rendered flows at desktop and mobile widths;
4. summarize what changed, what was verified, and what remains intentionally unresolved.

## Definition of done for implementation work

A change is not complete merely because it compiles. It must:
- match the frozen UX behavior;
- work at 1440px, 390px, and 320px where relevant;
- be keyboard-usable;
- avoid fake/dead affordances;
- preserve Urgent safety boundaries;
- preserve Pets/Farm distinction;
- preserve localization/medical-governance rules;
- pass the applicable automated checks.
