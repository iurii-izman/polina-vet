# Preview architecture

Production remains static Astro built from published Sanity content. A Sanity publish triggers a validated static rebuild and deployment; public runtime does not read drafts.

Future preview is intentionally separate: a server-rendered, draft-aware Astro mode with a draft token, Sanity Presentation Tool, and Visual Editing overlays. It will be noindex and access-controlled as appropriate. This repository does not yet select a hosting provider, issue a draft token, or implement preview routes.
