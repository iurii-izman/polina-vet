# ADR-002 — Static-first public rendering

Status: Accepted

Decision:
Public production pages are prerendered/static by default.

Dynamic/server rendering is added only for features that genuinely require it, such as preview/drafts or future live functionality.

Rationale:
performance, operational simplicity, rural/mobile bandwidth, lower runtime surface.
