# POLINA VET — Architecture v1.1

## Current lifecycle state

The M1–M14.5 architecture and public launch baseline is closed. The public site is static-first and may run on the temporary production origin while the permanent `lina.vet` migration remains an R1 follow-up. Development is frozen for observation; production changes require an explicit owner request and must preserve the boundaries below.

## Product shape

POLINA VET is a static-first multilingual veterinary guidance and routing hub.

Primary verticals:
- Pets
- Farm

Global Urgent is a router:
- `/[lang]/urgent/`
- `/[lang]/pets/urgent/`
- `/[lang]/farm/urgent/`

## Repository target

```text
polina-vet/
├── apps/
│   ├── web/          # Astro
│   └── studio/       # Sanity Studio
├── packages/
│   └── shared/       # only if genuinely shared code/types justify it
├── docs/
├── tests/
├── .agents/skills/
└── AGENTS.md
```

Use a pnpm workspace. Do not introduce Nx/Turborepo unless actual scale later justifies it.

## Frontend

- Astro current stable major compatible with the frozen design.
- TypeScript strict.
- Static-first public pages.
- Server/draft-aware preview environment only where required for Sanity Visual Editing.
- Minimal client JavaScript.
- Responsive design verified at 1440, 390, and 320 widths.
- Print styles for canonical checklists.

## CMS

Sanity Studio controls structured content.

Core launch types should remain minimal and traceable to the Blueprint:
- article
- clinicalCase (conditional launch)
- page
- author
- species
- topic
- source
- siteSettings
- only add seasonalAlert if the real content workflow requires structured validity/severity fields.

Do not create a universal page builder.

## Localization

Routes:
- `/ru/`
- `/ro/`
- `/uk/`

Long-form medical content:
- separate documents per language;
- stable translation family;
- explicit `translatedFrom`;
- `medicalRevision`;
- `sourceMedicalRevision`.

Taxonomy labels/synonyms may use field-level localization.

System/UI microcopy lives in frontend i18n dictionaries rather than Sanity.

Missing translation:
- no fake indexable localized article;
- language switcher may present the missing state and offer current RU version.

Stale translation:
- derived from source medical revision;
- high-risk stale body may be withheld until reviewed.

## Medical content facts vs derived states

Store facts:
- medicalOwner
- riskLevel
- medicalRevision
- sourceMedicalRevision
- lastMedicalReview
- reviewInterval
- archived / withdrawn
- sources

Derive:
- next review due
- current / review due / overdue
- translation current / review required
- canonical/alternate locale mapping where practical

## SEO

- self-canonical localized pages;
- hreflang only for genuinely published alternates;
- reciprocal alternate links;
- language-prefixed routes;
- stable published slugs;
- previous-slug redirects.

## Search

Search is conditional.
Do not ship a decorative/dead search input.
If the launch corpus does not justify search, navigation and related-content discovery are sufficient.

## Deployment

Production public site:
Sanity publish → Astro build with the explicit production origin/indexability flags → SEO/content validation → static Worker deploy.

Private operational plane:
public Intake Worker → isolated production D1 → protected Office Worker → PII-free notification adapter. Sanity and public analytics are not stores for private inquiries. Private M14.5 learning telemetry uses a separate Analytics Engine dataset from any public analytics provider.

Production Intake is active with `PUBLIC_INTAKE_ENABLED=true` under the owner-authorized technical launch decision. Article 22 evidence remains pending and does not become a legal-compliance claim. Future changes to this boundary require an explicit owner decision and the pause/restart process.

Preview:
server/draft-aware environment with Sanity preview/visual editing when implemented.

Cloudflare is the selected current runtime for the static Worker, private Workers, D1, Access boundary, Turnstile, and Analytics Engine. This is an implementation fact, not permission to add more Cloudflare infrastructure without a concrete requirement.

## Quality gates

Root `pnpm check` should eventually cover:
- formatting/lint
- TypeScript/Astro checks
- schema/type generation validation
- content validation
- build

Additional:
- `pnpm test:e2e`
- `pnpm test:a11y`
- `pnpm test:visual` where useful

Policy-as-code should block:
- duplicate/colliding localized routes;
- invalid translation relationships;
- high-risk published content missing required governance metadata;
- invalid required source references;
- invalid hreflang mappings.

Warnings/dashboard rather than hard failures are appropriate for routine review-due states.

## Pause boundary

No new product milestone, workflow, integration, CMS type, AI capability, or public medical content is implied by this architecture after M14.5. Observation, incident response, content governance, and owner-controlled external setup are operational follow-ups; M15/M16 remain unstarted.
