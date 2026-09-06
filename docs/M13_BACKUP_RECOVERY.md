# M13 Backup & Recovery

D1 Time Travel is the primary recovery mechanism. It is always on for supported production-storage databases and provides point-in-time restore within the plan retention window (currently 30 days on Workers Paid and 7 days on Workers Free per current Cloudflare documentation). It is not a substitute for long-term retention policy.

Before a production migration:

1. confirm the database binding/name and current schema version;
2. inspect `wrangler d1 info polina-vet-operations-production` and obtain a current Time Travel bookmark;
3. apply the versioned migration explicitly with the production script;
4. verify schema, indexes, and a synthetic smoke record without using real PII;
5. stop and investigate if verification fails.

Inspect: `wrangler d1 info polina-vet-operations-production`. Retrieve a bookmark with `wrangler d1 time-travel info polina-vet-operations-production --timestamp=<RFC3339>`. Restore only after an incident decision and explicit operator confirmation; restore is destructive in place. For recovery beyond the Time Travel window, an owner-approved export strategy is required; M13 does not add a second backup platform.

Local and staging D1 are separate from production. Production data must never be copied into local, tests, or CI.
