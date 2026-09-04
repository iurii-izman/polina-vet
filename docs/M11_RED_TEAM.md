# M11 independent red-team review

Review date: 2026-09-04  
Base: `18ac4357c7d1384fca4169707a24120fd47e9a3d`  
Branch: `feat/launch-candidate-m11`

This is a second-pass launch review performed against the frozen M11 brief. It considers product safety, localization, accessibility, SEO, privacy, security, and release reliability. It is not a redesign review.

## Findings

| Severity | Finding | Evidence / decision |
|---|---|---|
| BLOCKER (gate) | Final public domain is not supplied. | No domain was guessed or purchased. Production DNS, HTTPS, canonical, robots, sitemap, external draft-isolation, and Search Console cannot be accepted until the approved domain is provided. This is a business gate, not a product defect. |
| MAJOR (unverified gate) | Candidate-origin draft isolation and protected-host smoke tests remain to be run on deployed infrastructure. | The repository has separate staging, preview, and Studio configurations and fail-closed indexability logic, but deployed-origin evidence is unavailable in this environment. Keep indexability off and complete these probes before launch. |
| MINOR | Local Sanity TypeGen hangs after schema extraction. | Known M10 tooling limitation; `astro check`, content validation, unit tests, and release configuration validation pass. Do not weaken CI or treat this as launch approval. |

## Accepted safety conclusions

- No new medical content is published by this milestone. The six existing RU articles remain the public medical corpus; the 42 M10 documents remain drafts.
- Urgent remains a contextual router, not a third medical article, and contact availability is separate from urgency.
- No testimonials, prices, booking, fake availability, unsupported credentials, or clinical cases were introduced.
- Repository policy and route tests gate drafts, stale translations, withdrawn content, and invalid alternates from public discovery.
- RO and UK medical coverage must remain honest rather than being filled with unreviewed translations.

## Launch decision

No application BLOCKER was found in the domain-independent repository review. The launch remains **NO-GO until the final-domain and deployed-origin gates are completed**.
