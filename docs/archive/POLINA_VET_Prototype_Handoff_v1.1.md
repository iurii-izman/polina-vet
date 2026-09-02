# POLINA VET — Prototype Handoff v1.1

## Status
This handoff supersedes v1.0 for implementation planning.

## Frozen upstream documents
- Product Blueprint v1.1
- Content & UX Freeze v1.0

## Prototype artifact
`POLINA_VET_High_Fidelity_Prototype_v1.1_redteam_patch.html`

## Red-team corrections now part of the contract

### Global UX
- Desktop header includes explicit language control.
- Mobile header must contain: brand + short urgent action + menu.
- Mobile menu contains all primary navigation + language entry.
- No hero photograph before H1/lead/first useful action on mobile.
- Footer navigation remains functional, not decorative text.
- Keyboard focus state and skip navigation are required.

### Homepage
- `Животное заболело` must NOT automatically route to Urgent.
- It routes to a Pet/Farm context selector.
- `Подготовиться к обращению` must NOT default to Pet.
- It routes to `Before Visit` or `Before Vet Arrives` after context selection.
- Frozen sections restored:
  - How content is made
  - Featured knowledge
- Clinical case block is conditional and hidden until a real approved case exists.
- Seasonal panel is conditional and disappears completely when empty.

### Pets vs Farm
- The two verticals must not be visually identical.
- Pet layer: lighter, owner-first, symptom/prevention oriented.
- Farm layer: more operational, group/environment/biosecurity oriented.
- Do not use English `PET/FARM` labels in production UI.

### Urgent
- `/urgent/` is only a router.
- Pet and Farm have separate urgent flows.
- Red flags must not imply Polina is an emergency provider.
- Before direct Polina contact, show the operational boundary:
  use faster available veterinary help when delay is unsafe.
- No binary green/safe triage.

### Localization states required in UI
- current translated version
- missing translation
- translation review required
- withdrawn high-risk content
- no fake localized placeholder route

### Required conditional prototype states
- seasonal panel active / hidden
- clinical case block enabled / hidden

### Accessibility/performance
- Project target remains ≥44px primary touch controls.
- Muted text token must pass AA for normal small text on the warm background.
- Use `:focus-visible`.
- Preserve semantic landmarks and skip link.
- Low-JS/static-first remains the production principle.

## Astro component implications
Global:
- `SiteHeader`
- `MobileNav`
- `LanguageSwitcher`
- `SiteFooter`
- `UrgentAction`
- `Breadcrumbs`
- `SkipLink`

Routing:
- `TaskContextRouter` for generic homepage tasks
- `UrgentGateway`
- `PetUrgent`
- `FarmUrgent`

Conditional content:
- `SeasonalPanel` renders only when active content exists
- `FeaturedCase` renders only when an approved case exists

Medical content:
- `MedicalMeta`
- `SafetyNotice`
- `RedFlagCategory`
- `Checklist`
- `SourceList`
- `NextSteps`
- `TranslationState`
- `WithdrawnState`

## Sanity implications
No architectural change from Blueprint v1.1:
- stable translation family
- `medicalRevision`
- `sourceMedicalRevision`
- `primaryDomain`
- derived review/translation states
- risk-based governance
- reusable Source entities
- no fake future feature flags

## Codex boundary
Codex should implement the frozen IA/content behavior, not redesign it.
Do not generate booking, commerce, AI triage, owner dosing tools, testimonials, fake availability, or invented Polina facts.

## Before Codex implementation
Run one independent multimodal visual/UX red-team on Prototype v1.1.
Apply only high-confidence corrections.
Freeze Prototype v1.2.
Then scaffold Astro + Sanity.
