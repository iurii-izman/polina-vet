---
name: sanity-change
description: Use before changing Sanity schemas, GROQ queries, Studio structure, localization relationships, content migrations, TypeGen, preview integration, or content validation.
---

# Sanity Change

1. Read `apps/studio/AGENTS.md` and relevant architecture ADRs.
2. Use current official Sanity documentation/MCP when available.
3. Inspect existing schemas before editing.
4. Keep schemas minimal and aligned with the frozen Blueprint.
5. Do not use `_rev` as medical revision.
6. Do not duplicate handwritten TypeScript CMS interfaces when TypeGen can generate them.
7. For schema changes:
   - update schema;
   - extract/generate types as configured;
   - update GROQ queries;
   - run validation/type checks;
   - document any migration requirement.
8. Never destructively delete datasets/documents without explicit approval.
9. Do not store private patient/client data in the public CMS.
10. Prefer derived editorial states over manually synchronized duplicate fields.

At completion, report schema changes, generated-type impact, migration impact, and validation results.
