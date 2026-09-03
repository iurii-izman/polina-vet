# M6 + M7 multilingual and editorial workflow

## Public languages

- Russian (`/ru/`) remains the complete published baseline.
- Romanian (`/ro/`) and Ukrainian (`/uk/`) provide the reviewed core journeys.
- Empty RO/UK Knowledge sections are explicit, `noindex`, and never substitute Russian article bodies.

## Translation model

Medical long-form translations are separate Article documents in one family:
`translationGroupId`, `language`, `translatedFrom`, `medicalRevision`, and
`sourceMedicalRevision`. The derived states are `CURRENT`, `REVIEW_REQUIRED`,
`PENDING`, and `WITHDRAWN`. Sanity `_rev` is not medical freshness.

In Studio, open a published RU Article and use `Создать перевод · RO` or
`Создать перевод · UK`. The action refuses non-RU sources and duplicate drafts.
The draft starts without `sourceMedicalRevision`; translate and medically review
it before using `Подтвердить медицинский пересмотр перевода`. That action copies
the exact current source `medicalRevision` and never publishes the document.

When the RU medical revision changes, the translation becomes `REVIEW_REQUIRED`.
Its old body is not discoverable as current. A previously published stale URL is
kept as a noindex safety state; withdrawn content uses its safe replacement.

## Local preview

Public production remains static:

```text
pnpm build
```

Run the server-rendered preview with:

```text
pnpm --filter @polina-vet/studio dev
pnpm --filter @polina-vet/web preview:server
```

Required names (values are local secrets/configuration and are never committed):

```text
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_STUDIO_URL=http://localhost:3333
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=http://localhost:4321
```

The read token is server-only. Preview validates the Presentation Tool handshake
with `@sanity/preview-url-secret`, uses the drafts perspective, adds Content
Source Maps/stega, sets `noindex` and `private, no-store`, and mounts the
Visual Editing overlays only while the perspective cookie is present.

Sanity Studio Presentation locations map Articles and Pages to their locale
routes. Add the local preview origin to Sanity CORS with credentials enabled.

## Deferred

Full SEO, Lighthouse/security hardening, deployment, DNS, webhooks, hosted
preview, and reviewed RO/UK medical Article corpora remain deferred to M8/M9 or
future medically reviewed content work.
