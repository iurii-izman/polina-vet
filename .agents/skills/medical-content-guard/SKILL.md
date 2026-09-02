---
name: medical-content-guard
description: Use for any change to public medical content, Urgent flows/copy, medical article templates, medical content schemas, translation freshness, review/source metadata, or clinical cases. Do not use for purely decorative CSS changes with no medical-content impact.
---

# Medical Content Guard

Before changing medical-content behavior:

1. Read `docs/MEDICAL_SAFETY.md`.
2. Read the relevant frozen product/prototype section.
3. Identify whether the change is HIGH, STANDARD, or LOW risk.
4. Preserve the boundary between public guidance and individualized treatment.
5. Do not invent medical claims or finalize copy explicitly marked as requiring medical review.
6. Preserve:
   - medicalOwner
   - riskLevel
   - medicalRevision
   - review facts
   - sources
   - translation lineage
7. Verify Urgent never becomes binary “safe/not safe” triage.
8. Verify Polina contact does not imply 24/7 emergency availability.
9. Verify stale high-risk translation/content cannot masquerade as current.
10. If the implementation would publish or materially alter medical claims, stop and surface exactly what needs clinical review.

At completion, report:
- medical behavior changed;
- safety boundary preserved;
- fields/validators affected;
- clinical-review items still pending.
