# M12 acceptance

- Baseline: `c39e41eaca5242d49661c1798ac44074f43ed4ec`; branch: `feat/growth-measurement-m12`.
- Provider: Plausible-compatible, disabled until a real domain identifier and explicit `PUBLIC_ANALYTICS_ENABLED=true` production opt-in; independent of indexability; privacy-first/no cookies posture.
- Measurement: eight-event taxonomy and Useful Next Step model in `M12_MEASUREMENT_SPEC.md`; typed allowlist rejects PII.
- Campaigns: deterministic `pnpm growth:link`; permanent QR waits for R1.
- Channels: existing Telegram/phone/map remain controlled; future channels are absent until configured.
- Geo/local SEO/GBP/content/dashboard: documented with audience/service distinction, no doorway pages, no account invention, and human medical approval.
- R1: unchanged; temporary production remains PUBLIC + NOINDEX. M10 drafts remain isolated. M13 not started.
- Channel renderer: shared normalized renderer for verified Telegram/phone plus enabled, valid registry channels in RU/RO/UK contact surfaces.
- Validation and live checks: pending final implementation pass and candidate deployment.
