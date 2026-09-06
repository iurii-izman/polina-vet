import { purgeExpired, retentionDryRun, type OperationsDb } from './db.js';
export { retentionDryRun, purgeExpired };
export async function runRetention(db: OperationsDb, dryRun: boolean) {
  return dryRun ? (await retentionDryRun(db)).length : purgeExpired(db);
}
