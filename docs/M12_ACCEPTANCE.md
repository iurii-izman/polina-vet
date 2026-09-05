# M12 acceptance

- Baseline: `c39e41eaca5242d49661c1798ac44074f43ed4ec`; branch: `feat/growth-measurement-m12`.
- Provider: Plausible-compatible, disabled until a real domain identifier and explicit `PUBLIC_ANALYTICS_ENABLED=true` production opt-in; independent of indexability; privacy-first/no cookies posture.
- Measurement: eight-event taxonomy and Useful Next Step model in `M12_MEASUREMENT_SPEC.md`; typed allowlist rejects PII.
- Campaigns: deterministic `pnpm growth:link`; permanent QR waits for R1.
- Channels: existing Telegram/phone/map remain controlled; future channels are absent until configured.
- Geo/local SEO/GBP/content/dashboard: documented with audience/service distinction, no doorway pages, no account invention, and human medical approval.
- R1: unchanged; temporary production remains PUBLIC + NOINDEX. M10 drafts remain isolated. M13 not started.
- Channel renderer: shared normalized renderer for verified Telegram/phone plus enabled, valid registry channels in RU/RO/UK contact surfaces.
- Closure rule: M12 is complete with analytics OFF, future channels unconfigured, and GBP uncreated when implementation, fail-closed behavior, privacy/security, live candidate, and R2 tracking are complete.
- R2: OPEN / WAITING FOR OWNER-CONTROLLED EXTERNAL ACCOUNTS; tracked in GitHub issue #12 and does not block M12.
- Validation: content, M10, growth, full check, Sanity verification, preview, release validation, E2E `81/81`, and accessibility `46/46` PASS.
- Live candidate: `https://lina.aipipeline.cc`, Worker `polina-vet-production`, version `116aee29-f32f-4516-9b82-7ad598a4aecc`; `verify:origin` PASS, `indexable=false`, draft isolation PASS, 51 routes/48 sitemap routes, no localhost leakage, analytics OFF, CSP and `X-Robots-Tag` present.
- R2: OPEN / WAITING FOR OWNER-CONTROLLED EXTERNAL ACCOUNTS; tracked in GitHub issue #12 and does not block M12.
