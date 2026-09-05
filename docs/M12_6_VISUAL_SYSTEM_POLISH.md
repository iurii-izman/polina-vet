# M12.6 — Visual system consolidation and premium polish

## Direction

The visual system remains warm, practical and editorial. The refinement uses proportion, restrained surface contrast and consistent spacing rather than decorative effects.

## Visual grammar

- Widths: wide (1220px) for product compositions, section (1020px) for structured grids, readable (760px) for prose and medical articles.
- Type: a display role for the Home hero, page-title role for landings, and article-title role for long medical headings.
- Spacing: page intro, section, component and inline tokens compose vertical rhythm.
- Surfaces: page, card, context, dark feature and urgent each have distinct semantic roles.

## Key decisions

- Knowledge uses two columns from 981px upward. Current medical titles retain their full card measure; tablet and mobile remain a single column.
- About removes the duplicate page eyebrow, uses a wider profile composition, then returns the narrative to readable measure.
- Contact uses a section-width availability panel followed by a balanced three-card desktop grid, two columns on tablet, and one on mobile.
- Pet and Farm gateways now share dark-surface typography; Farm retains a fine warm rule rather than a heavy top rim.

## Validation model

CI enforces deterministic geometry, responsive, behavior and accessibility invariants, including the M12.5 K-001 and IMG-001 regression controls. The local/manual visual set is the 17 pixel screenshots covering RU Home, Pets, Farm, Knowledge, About, Contact, Urgent and a representative article at desktop and mobile, plus the open language menu. Pixel screenshot baselines are not a Linux CI gate; `output/m12.6-audit/` holds untracked review evidence.

## Deferred

No product, medical-content, translation, R1/R2, analytics or M13 scope is changed by this milestone.
