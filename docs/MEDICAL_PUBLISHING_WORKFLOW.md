# Medical publishing workflow

This is the operational contract for governed medical content. It does not publish content by itself.

## Article lifecycle

`DRAFT` → medical content entered → sources attached → medical owner review → risk classification → independent review for HIGH → `medicalRevision` confirmed → `lastMedicalReview` confirmed → policy validation → publish → static build → ongoing review lifecycle.

The public body must contain reviewed, source-backed material. AI must not publish medical content automatically. Concrete red flags, treatment, medication, dosing, urgent instructions and clinical cases remain subject to human medical review and verified author facts.

## Translation lifecycle

RU is the source document for the current MVP. When its medical revision changes, each translation is compared using `translatedFrom.medicalRevision` against the translation's `sourceMedicalRevision`. A stale translation is not shown as current; its medical body may be withheld until human re-review. A missing translation has no indexable fake route.

## Source lifecycle

`current` → `superseded` → `supersededBy`, or `withdrawn`. The original reference remains for provenance. Affected articles enter the Studio attention path; source text is never silently substituted.

## Static time-governance invariant

Before public launch with governed medical content, production must have both:

1. a rebuild/validation on relevant Sanity article publish and source-lifecycle change;
2. a scheduled periodic rebuild/validation so date-based review states cannot remain stale in a static artifact.

Hosting, webhook and scheduler implementation are intentionally deferred to Release Engineering. No client-side safety workaround is used.
