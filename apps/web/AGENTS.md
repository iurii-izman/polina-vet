# apps/web — Astro frontend instructions

Scope: public POLINA VET frontend.

## Architecture
- Astro, static-first public output.
- Minimal client JavaScript; use client directives only for genuine interaction.
- RU/RO/UK routes use explicit language prefixes.
- Do not create indexable placeholder routes for missing translations.
- Keep shared content/domain logic independent of visual components where practical.

## UX
- Implement the frozen Prototype v1.2 behavior, not the prototype's hash-SPA mechanics.
- Use normal Astro document routing.
- Global Urgent is always discoverable.
- Mobile header: brand + compact Urgent action + menu.
- Do not put decorative imagery before H1/first useful action on narrow screens.
- Actionable cards must have explicit visible affordance.
- Static cards must not look interactive.
- No fake search control: either ship working lightweight search or render non-search discovery UI.

## Accessibility/performance
- WCAG 2.2 AA target.
- 44px primary touch targets.
- `:focus-visible`, skip link, semantic landmarks.
- Respect `prefers-reduced-motion`.
- Optimize images; prefer responsive Sanity image URLs.
- Avoid heavy JS bundles and unnecessary third-party scripts.

## Content
- Never invent Polina facts.
- Never turn medical placeholders into production claims.
- Farm medical pages must display the same governance contract as Pet medical pages.
