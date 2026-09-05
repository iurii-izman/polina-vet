# M12.5 UI/UX Hardening

## Scope and baseline

M12.5B targets the two approved M12.5A visual findings only. The implementation branch starts from `main` at `8879afdcbcdb6ffeb08da683a4777147449b0edc`.

Approved decisions retained:

- Knowledge remains a single-column editorial listing at approximately 760px.
- Farm spacing remains unchanged.
- Global typography remains unchanged.
- The real Polina photograph and forest trust-layer concept remain unchanged.
- The sticky-header duplication in the old full-page focus capture is a capture artifact and was not fixed.

## Sonar review

The PR annotation reported two new issues, both in the byte-verified frozen prototype reference rather than production code:

1. Rule/title: accessible name should be part of the visible label; issue key `AaByok0DwSzpTW4LP3W1`; `docs/reference/prototype-v1.2/POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html:31`; severity unspecified in the annotation. The frozen prototype language button uses visible `RU` plus an accessible label “Выбрать язык”. This is a valid generic accessibility recommendation for the standalone prototype, but it is not a production defect and changing it would invalidate the required reference SHA-256.
2. Rule/title: use `<dialog>` instead of `role="dialog"`; issue key `AaByok0DwSzpTW4LP3W2`; `docs/reference/prototype-v1.2/POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html:39`; severity unspecified in the annotation. The prototype’s static demonstration sheet is not the production language component; changing the frozen artifact is prohibited and would invalidate its required SHA-256.

Resolution: no code suppression and no source change. These are documented, narrow, accepted out-of-scope findings. Sonar’s final PR check reports Quality Gate PASS, 0 Security Hotspots, and no reportable unresolved production issues.

## K-001 — Knowledge title measure

Before: representative cards were approximately 760px wide at 1440px and 358px wide at 390px, while `.knowledge-card h3` was capped at 208px by a selector shared with task-card titles.

After: task-card titles retain the 13rem compact measure; Knowledge headings use the available card measure with 2.5rem of internal right clearance for the arrow affordance. The single-column list, card padding, summaries, order, and H3 typography remain unchanged. The expected representative title widths are approximately 718px at 1440px and 316px at 390px.

Regression protection checks the relationship rather than a pixel-perfect value: title width must exceed 208px, remain inside the card, and produce no horizontal overflow at 1440, 390, and 320px. These critical visual invariants are CI-enforced through the Playwright smoke suite.

## IMG-001 — Home trust portrait geometry

Before: the Home trust portrait rendered at approximately 176×1402px at 1440px, leaking intrinsic/HTML height into the trust composition. About independently rendered correctly at approximately 370×462.5px.

After: the trust-specific portrait uses a bounded responsive frame with `object-fit: cover`, `object-position: center 20%`, and an approximately 4:5 geometry: 288×360px on desktop and 240×300px on narrow mobile. The real image, crop direction, trust copy, mini-cards, and forest section remain unchanged.

Regression protection checks portrait ratio bounds, `object-fit: cover`, and no horizontal overflow at 1440, 390, and 320px. These critical visual invariants are CI-enforced through the Playwright smoke suite. About remains a regression control and is not modified.

## Visual regression baseline

The small stable Playwright baseline contains 10 viewport snapshots:

- Home 1440
- Home 390
- Knowledge 1440
- Knowledge 390
- About 1440
- Contact 390
- Urgent 390
- Article 1440
- Article 390
- Language menu open 1440

Snapshots use deterministic viewports, `prefers-reduced-motion: reduce`, loaded fonts, disabled animations, and viewport captures rather than stitched full-page captures. They are a local/manual visual reference, not a GitHub CI gate. CI enforces the critical visual invariants through smoke assertions; K-001 and IMG-001 also have bounding-box assertions.

## Validation

Passed locally:

- `pnpm check`
- `pnpm test:e2e` — 83 passed
- `pnpm test:a11y` — 46 passed
- `pnpm --dir apps/web exec playwright test tests/visual.spec.ts` — 10 passed
- `pnpm release:validate`
- `git diff --check`

The existing Astro check reports one pre-existing hint for the processed `nav.js` script and no errors.

## Deferred and unchanged

Footer styling, unrelated spacing, Farm whitespace, header proportions, typography scale, article layout, button design, medical content, Sanity governance, translation behavior, analytics, SEO/indexability behavior, R1, R2, and M13 are outside this milestone.

## Release status

M12.5 is closed. PR #14 was merged by squash from exact candidate head `7b05dd3b8234e7acc30feced1b89bf16c9154448` at `2026-09-05T18:27:53Z`, producing merge commit `eb7771972a63688cb42e5b1063c7297a9ea7e133`. `main` was fast-forwarded to that merge commit before deployment.

## Live production evidence

Merged `main` deployed to `https://lina.aipipeline.cc` on Worker `polina-vet-production`, version `e6d17804-da25-418e-b717-a40e3228553b`. Production deployment used `SITE_INDEXABLE=false` and `PUBLIC_ANALYTICS_ENABLED=false`.

`VERIFY_ORIGIN=https://lina.aipipeline.cc EXPECT_INDEXABLE=false pnpm verify:origin` passed: 51 routes, 48 sitemap routes, draft isolation PASS, static root redirect, and indexability false.

Post-deploy live checks passed for Home and Knowledge at 1440/390, Home trust at 1440/390, and locale spot checks. RU/RO/UK mobile checks preserved urgent access and measured no overflow; `/ro/contact/` preserved the urgent limitation before contact methods; `/uk/urgent/` preserved the localized urgent action at 320px.

Post-merge live smoke passed on the merged-main deployment: Home trust measured 288×360 at 1440px and 240×300 at 390px with `object-fit: cover`; Knowledge title measures were 718px and 316px with no title overflow; About remained within its independent portrait geometry; all checked viewports had no horizontal overflow. Robots remained noindex and no analytics script was present.

Lighthouse desktop reports for Home, Knowledge, About, and Article each scored Performance 100, Accessibility 100, and Best Practices 100 with CLS 0. Reported LCP was 343ms Home, 330ms Knowledge, 532ms About, and 341ms Article in this run. Lighthouse’s Windows Chrome launcher emitted an EPERM while cleaning its temporary directory on some runs after writing the report; the JSON reports were produced and scores were read successfully.

Temporary after-state evidence is under `output/m12.5-audit/after/` and is intentionally untracked.

## PR and CI

PR: https://github.com/iurii-izman/polina-vet/pull/14
State: MERGED, non-draft, squash merge.

- GitHub Actions `verify`: PASS (83 E2E and 46 accessibility checks included in the workflow).
- Cloudflare Workers Builds `polina-vet-staging`: PASS.
- SonarCloud Code Analysis: PASS. The two annotated issues are the documented, accepted out-of-scope recommendations in the byte-verified frozen prototype reference.
- Security Hotspots: no reportable hotspot was surfaced by the PR check; no findings were introduced by this narrow CSS/test/documentation change.

The exact-head checks passed before merge. The merge commit is `eb7771972a63688cb42e5b1063c7297a9ea7e133`; deployment and origin verification were performed from merged `main`.
