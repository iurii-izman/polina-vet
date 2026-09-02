# ADR-005 — Separate medicalRevision

Status: Accepted

Decision:
Use an explicit `medicalRevision` for medically meaningful changes.

Do not use Sanity `_rev` as a proxy for medical freshness because `_rev` also changes for editorial/SEO/cosmetic edits.

Translations track `sourceMedicalRevision`.
