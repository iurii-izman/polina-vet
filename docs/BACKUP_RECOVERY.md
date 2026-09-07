# POLINA VET — Current Backup and Recovery Guidance

## Primary mechanism

Cloudflare D1 Time Travel is the current point-in-time recovery mechanism for `polina-vet-operations-production`. It is separate from retention deletion. The available recovery window depends on the Cloudflare plan and must be checked at incident time; it is not a promise of indefinite backup.

## Before a production migration

1. Confirm the exact database name, binding, database ID, and selected production Worker configs.
2. Run `d1 info` and a Time Travel information query with an RFC3339 timestamp. Record only the non-secret recovery reference in the change record.
3. Confirm the migration list and current schema; production currently has `0001` and `0002_m14_core` applied.
4. Apply only the reviewed versioned migration.
5. Verify migration state, foreign keys, indexes, and zero synthetic residue where applicable.

Example commands:

```powershell
pnpm --filter @polina-vet/intake exec wrangler d1 info polina-vet-operations-production
pnpm --filter @polina-vet/intake exec wrangler d1 time-travel info polina-vet-operations-production --timestamp=2026-09-07T00:00:00Z
pnpm --filter @polina-vet/intake exec wrangler d1 migrations list DB --remote --env production --config wrangler.jsonc
```

## Restore boundary

An in-place restore is destructive. It requires an explicit incident decision, operator confirmation, a recorded recovery point, and post-restore schema/foreign-key/application smoke checks. Do not restore merely because a query is inconvenient or a normal retention job ran.

For recovery beyond the Time Travel window, an owner-approved export/backup strategy is required. No second backup platform is part of the paused baseline.

## Data isolation

Production private data must never be copied to local, staging, CI, Sanity, public analytics, Telegram, or issue/PR text. Retention deletion follows the privacy operations procedure and does not replace backup evidence.
