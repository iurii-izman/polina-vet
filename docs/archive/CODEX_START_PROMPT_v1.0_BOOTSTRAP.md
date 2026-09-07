# POLINA VET — Codex Start Prompt v1.0

You are the senior implementation engineer responsible for bootstrapping and beginning production development of POLINA VET.

Work in:
`C:\Dev\polina-vet`

This is not a greenfield product-design exercise. Product architecture, UX behavior, and prototype direction are frozen.

## 0. Your role

Implement the frozen product faithfully and build a maintainable engineering system around it.

Do NOT:
- redesign the product;
- reopen Pets/Farm/Urggent architecture;
- invent Polina facts, contact details, clinical cases, legal claims, or medical copy;
- add booking, prices, payments, AI diagnosis, symptom checker, owner dose tools, testimonials, 24/7 claims, or other non-MVP features;
- choose “more scalable” infrastructure merely because it exists.

Prefer simple, current, well-documented solutions.

## 1. Read before writing code

First read completely, in this order:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/Product Blueprint v1.1.md`
4. `docs/Content & UX Freeze v1.0.md`
5. `docs/POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html`
6. `docs/POLINA_VET_Prototype_v1.2_Decision_Log.md`
7. `docs/POLINA_VET_Prototype_Handoff_v1.2_CODEX_READY.md`
8. `docs/ARCHITECTURE.md`
9. `docs/MEDICAL_SAFETY.md`
10. all accepted ADRs in `docs/ADR/`

Then summarize in no more than 15 bullets:
- frozen decisions;
- factual placeholders;
- implementation constraints;
- what this first milestone will and will not do.

If canonical files listed above are missing, stop before product implementation and report exactly which files are missing. Do not reconstruct them from memory.

## 2. Verify the local environment

Inspect, do not assume:

```powershell
git --version
node --version
corepack --version
pnpm --version
gh --version
gh auth status
codex --version
codex mcp list
```

Use current stable tooling compatible with the project and existing Node environment. Do not upgrade the user's global tools unnecessarily.

For framework/library syntax, use Context7/current official documentation.

## 3. GitHub repository bootstrap — explicitly authorized

The user has authorized creation of a new GitHub repository for this project.

Requirements:
- repository name: `polina-vet`
- visibility: PRIVATE
- local source: current `C:\Dev\polina-vet`
- default branch: `main`
- do not change it to public;
- never push secrets.

If this folder is not yet a Git repository:

```powershell
git init
git branch -M main
```

If no GitHub `origin` exists and `gh auth status` is valid, create:

```powershell
gh repo create polina-vet --private --source . --remote origin
```

If the repository already exists, inspect it and reuse it instead of creating another repository.

Do not push until the documentation/bootstrap cleanup below is complete and `git diff/status` is reviewed.

## 4. Normalize documentation

Do not edit the meaning of frozen documents.

Ensure active canonical docs remain in `docs/`.

Move superseded files to `docs/archive/`, including when present:
- `POLINA_VET_Prototype_v1.0_RedTeam_Findings.md`
- `POLINA_VET_Prototype_Handoff_v1.1.md`
- obsolete prototype versions not used as the frozen source

Do not delete historical documents unless explicitly asked.

Confirm `docs/README.md` clearly distinguishes canonical vs archive.

## 5. Configure the agreed Codex toolchain

Target toolchain:
- Context7
- Sanity official MCP / Agent Toolkit
- one Chrome DevTools MCP
- GitHub via native Git/GitHub CLI/integration

Do NOT add Figma MCP now.
Do NOT install overlapping browser MCPs.

### Context7
If not already available, prefer the official Context7 Codex plugin flow documented by Context7.
After configuration, verify it is available in a new/current Codex context as appropriate.

### Sanity
Use Sanity's current official AI-agent/MCP guidance.
Prefer OAuth/CLI authentication.
Use `https://mcp.sanity.io` / Sanity CLI configuration rather than deprecated local MCP packages.

### Chrome DevTools
If absent, configure one Chrome DevTools MCP appropriate for Windows/Codex and verify it appears in `codex mcp list`.

Do not put tokens/API keys into repository files.

If any setup step requires a browser OAuth approval or other human interaction, pause only for that interaction, then continue after it is completed.

## 6. Create the engineering workspace

Bootstrap a pnpm workspace with:

```text
apps/
  web/       Astro
  studio/    Sanity Studio
packages/
  shared/    only if real shared code warrants it
tests/
```

Do not add Nx or Turborepo.

### `apps/web`
- Astro
- TypeScript strict
- static-first public output
- RU/RO/UK language-prefix architecture
- production document routes, not prototype hash routing
- minimal JS
- design tokens based on frozen v1.2
- semantic global layout
- SiteHeader / MobileNav / LanguageSwitcher / Footer / SkipLink / UrgentAction
- accessibility foundations

### `apps/studio`
- Sanity Studio
- minimal schemas aligned with Blueprint v1.1
- Studio structure suitable for one practicing veterinarian
- TypeGen
- no invented production content
- no future commerce schema

Use official current Astro/Sanity docs while scaffolding.

## 7. Root developer commands

Create a clear root script contract.

At minimum aim for:

```text
pnpm dev
pnpm build
pnpm check
pnpm test:e2e
pnpm test:a11y
```

`pnpm check` should become the main deterministic quality command and include the appropriate:
- formatting/lint;
- TypeScript/Astro checks;
- Sanity/schema/type generation checks;
- content validation;
- production build.

Do not make `pnpm check` depend on external production services where avoidable.

Add unit tests only where logic justifies them; do not create test theatre.

## 8. Sanity data model — first implementation pass

Implement only the launch-critical structure defined by the frozen docs.

At minimum, evaluate/implement:

- article
- page
- author
- species
- topic
- source
- siteSettings

ClinicalCase may be included structurally if required by the frozen prototype, but it must remain content-empty until a real case exists.

Only introduce `seasonalAlert` if the actual structured requirements justify a separate type; otherwise keep seasonal promotion minimal.

Medical article governance must support:
- language
- stable translation family
- translatedFrom
- primaryDomain
- medicalOwner
- riskLevel
- medicalRevision
- sourceMedicalRevision where applicable
- lastMedicalReview
- reviewInterval
- sources
- archived/withdrawn
- previous slugs / redirect strategy

Prefer derived states rather than manually duplicated status fields.

Use Sanity TypeGen; do not hand-maintain duplicate CMS interfaces.

## 9. Policy as code

Create deterministic validation for the most important invariants.

At minimum plan/implement checks for:
- invalid/colliding localized routes;
- invalid translation family relationships;
- missing required governance for published HIGH-risk medical content;
- invalid required source references;
- fake/missing localized route generation;
- invalid hreflang relationships.

Do not fail the build merely because a normal STANDARD article is approaching review; routine editorial debt can be a warning/dashboard concern.

## 10. First vertical implementation milestone

Do NOT implement the entire website in this first run.

Implement enough production UI to prove the architecture:

1. root language handling / RU route;
2. global shell/header/footer;
3. Homepage skeleton faithfully matching the frozen hierarchy;
4. Pets landing shell;
5. Farm landing shell;
6. global Urgent router;
7. Pet Urgent and Farm Urgent page structure;
8. missing-translation and withdrawn-state component patterns.

Use placeholders where facts/medical content are not finalized.

Do not silently convert prototype placeholders into claims.

## 11. QA for milestone 1

Use actual rendered pages.

Check:
- 1440px desktop;
- 390px mobile;
- 320px mobile;
- keyboard/focus;
- no horizontal overflow;
- mobile header behavior;
- Urgent visibility;
- Pets/Farm visual/semantic distinction;
- language-switch states;
- actionable vs static-card affordance;
- reduced motion;
- no fake search.

Set up Playwright smoke coverage for critical routes.

Set up axe-based accessibility checks appropriate to the milestone.

Lighthouse CI may be scaffolded/configured now, but do not over-tune performance numbers before real assets/content exist.

## 12. Git workflow

After bootstrap passes checks:

1. review `git status` and `git diff`;
2. create a clean baseline commit;
3. push `main` only for the initial bootstrap baseline if needed;
4. for subsequent implementation work, create a feature branch, e.g.:
   `feat/foundation-milestone-1`
5. open a PR;
6. do not auto-merge.

If GitHub Actions are added in this run, keep them minimal and deterministic.

## 13. Stop condition for this first Codex run

Stop after:
- toolchain/bootstrap is configured;
- repository structure is established;
- agreed first vertical slice is implemented;
- relevant checks pass;
- GitHub PR is opened or the exact blocker is reported.

Do not continue into the entire content library, booking, deployment vendor selection, or production Sanity content entry.

## 14. Final report

Return a compact engineering handoff with:

### Environment
- versions used;
- tools/MCPs configured;
- authentication/manual steps still needed.

### Repository
- GitHub repo URL;
- branch;
- PR URL if created;
- key new files/directories.

### Architecture
- Astro/Sanity versions;
- rendering strategy;
- i18n approach;
- Sanity schema types;
- TypeGen status.

### QA
- commands run;
- pass/fail;
- desktop/mobile browser verification;
- known warnings.

### Intentionally unresolved
List placeholders that remain because the user has not supplied verified facts or final medical/legal content.

### Next milestone
Recommend exactly one next implementation milestone; do not begin it automatically.
