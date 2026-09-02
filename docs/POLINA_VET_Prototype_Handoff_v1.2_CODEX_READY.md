# POLINA VET — Prototype Handoff v1.2 (CODEX READY)

## Frozen source artifacts
- Product Blueprint v1.1
- Content & UX Freeze v1.0
- `POLINA_VET_High_Fidelity_Prototype_v1.2_FROZEN.html`
- `POLINA_VET_Prototype_v1.2_Decision_Log.md`

## Implementation boundary
Codex is now invited to scaffold the real Astro + Sanity product.

Do NOT reopen:
- IA
- homepage section order
- Pets/Farm split
- Urgent routing
- core CTA meaning
- multilingual safety states
- Polina trust-layer positioning
- commercial-layer status

## Required production architecture
### Frontend
- Astro static-first public site
- server/draft-aware preview environment for Sanity Visual Editing
- minimal client JS
- RU/RO/UK prefixed routes
- semantic landmarks, keyboard focus, 44px primary touch targets
- print styles for checklists

### CMS
- Sanity structured content
- stable translation family
- `medicalRevision` separate from Sanity `_rev`
- `sourceMedicalRevision`
- `primaryDomain`
- risk-based review governance
- reusable Sources
- derived review/translation states

## Required product components
Global:
- SiteHeader
- MobileNav
- LanguageSwitcher
- SiteFooter
- SkipLink
- UrgentAction
- Breadcrumbs

Routing:
- TaskContextRouter
- UrgentGateway
- PetUrgent
- FarmUrgent

Homepage:
- HomeHero
- DomainGateway
- UrgentStrip
- QuickTasks
- SeasonalPanel
- PolinaTrust
- ContentMethodology
- FeaturedKnowledge
- FeaturedCase (conditional)
- ContactStrip

Medical:
- MedicalMeta
- SafetyNotice
- PracticalActions
- DontDoBlock
- RedFlagCategory
- Checklist
- SourceList
- NextSteps
- TranslationState
- WithdrawnState

Farm:
- GroupProblemEntry
- GroupRiskBlock
- BiosecurityBlock
- BeforeVetChecklist

## Critical behavior
1. Generic `Животное заболело` routes to Pet/Farm context, not automatically Urgent.
2. `/urgent/` is only a router.
3. Urgent pages show help boundary early, not only after long scrolling.
4. Contact page shows emergency/availability limitation before contact methods.
5. Farm exposes `Несколько животных заболели` in first-action zone.
6. Medical Farm content has the same governance metadata contract as Pet content.
7. Clickable cards have explicit action affordance.
8. Missing/stale translations never masquerade as current medical content.
9. No indexable fake translated placeholder route.
10. Withdrawn high-risk content never ends in naked 404.
11. Seasonal and Clinical Case blocks disappear fully when no valid content exists.
12. Search is conditional; do not ship a fake search control.

## Do not generate
- AI diagnosis
- symptom checker
- owner dose calculator
- booking/prices/payments unless explicitly enabled later
- fake 24/7
- testimonials/ratings
- invented Polina facts
- generic stock-vet identity

## Remaining placeholders
These must stay placeholders until factual input exists:
- Polina surname
- exact title/employer wording
- contacts
- availability
- service area
- real photography
- clinical case
- final legal copy
- final medically reviewed red flags
- final RO/Moldavian language policy
