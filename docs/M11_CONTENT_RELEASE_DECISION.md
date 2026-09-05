# M11 content release decision

Decision date: 2026-09-05
Baseline: M10 merged at `18ac4357c7d1384fca4169707a24120fd47e9a3d`

## v1.0 classification

| Classification | Content |
|---|---|
| PUBLISH AT V1 | Existing reviewed RU medical corpus: 6 articles |
| KEEP DRAFT POST-LAUNCH | All 42 M10 medical drafts pending the real human governance gates |
| WITHDRAW/REWORK | None identified by this audit |

## Counts

| Locale | Published medical | Draft medical | HIGH drafts | STANDARD drafts | QA drafts |
|---|---:|---:|---:|---:|---:|
| RU | 6 | 14 | 7 | 7 | 0 |
| RO | 0 | 14 | 7 | 7 | 0 |
| UK | 0 | 14 | 7 | 7 | 0 |
| Total | 6 | 42 | 21 | 21 | 0 |

Clinical cases: **0**. The educational poisoning article remains an explicitly synthetic Article, not a clinical case.

## Temporary candidate release state

- Public candidate: `https://lina.aipipeline.cc`.
- State: **PUBLIC + NOINDEX**.
- Published medical corpus remains RU 6 / RO 0 / UK 0.
- M10 intentional drafts remain 42; QA drafts remain 0.
- One additional pre-existing editorial draft is tracked separately and was not deleted or published; it is not a QA draft.
- The selected M10 draft remains draft-only in remote Sanity and is absent from live Knowledge/Pets discovery, direct public content, and sitemap.

No reviewer, independent sign-off, translation freshness, or medical revision state is fabricated by M11. Publication of any draft requires the existing editorial workflow and the applicable independent review, especially for HIGH-risk material.

M11 is closed for the temporary public + noindex candidate. Final-domain activation is an independent release gate tracked in [R1 — Final Domain & Public Launch Activation](R1_FINAL_DOMAIN_ACTIVATION.md) and does not block M12–M18.
