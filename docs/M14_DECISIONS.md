# M14 Decisions

## Frozen product decisions

- M14 extends the existing Office/D1 architecture; it does not introduce a second clinical backend.
- Pets and Farm remain separate operational contexts. Farm supports both individual animals and groups.
- One primary typed subject per encounter is sufficient for M14.
- Clinical records are practical free text with optional structured vitals and counts.
- Completed records remain correctable with optimistic concurrency and safe audit metadata.
- Vaccination, follow-up, and patient-alert ledgers are separate from narrative notes.

## Engineering decisions

- Migration ownership stays under `apps/intake/migrations` because it is already the canonical operations-D1 chain used by both Workers.
- `clinical_records` mirrors the encounter's practical text fields so the clinical record has a dedicated table while the encounter remains fast to list and draft. The encounter remains the write-path coordinator.
- Three nullable typed subject FKs plus a check constraint preserve relational integrity without introducing a generic polymorphic reference.
- M14 uses the existing CSP/private-header boundary and keeps the current Worker delivery model. No public Astro or Sanity behavior changes.
