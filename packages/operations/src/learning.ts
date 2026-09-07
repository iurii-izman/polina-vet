import type { OperationsDb } from './db.ts';
import type { SnapshotMetric } from './telemetry.ts';

type CountRow = { count: number | string };
export type DailySnapshot = Record<SnapshotMetric, number>;

const count = (row: CountRow | null) => Number(row?.count ?? 0);

export async function collectDailySnapshot(
  db: OperationsDb,
  now = new Date(),
): Promise<DailySnapshot> {
  const end = now.toISOString();
  const day = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const threeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [drafts, followups, animals, holdings, groups, encounters, medications, corrections] =
    await Promise.all([
      db
        .prepare(
          `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN started_at >= ? THEN 1 ELSE 0 END) AS lt_1d,
            SUM(CASE WHEN started_at < ? AND started_at >= ? THEN 1 ELSE 0 END) AS one_to_three,
            SUM(CASE WHEN started_at < ? AND started_at >= ? THEN 1 ELSE 0 END) AS three_to_seven,
            SUM(CASE WHEN started_at < ? THEN 1 ELSE 0 END) AS gt_7d
          FROM encounters WHERE status = 'DRAFT'`,
        )
        .bind(day, day, threeDays, threeDays, sevenDays, sevenDays)
        .first<{
          total: number | string;
          lt_1d: number | string;
          one_to_three: number | string;
          three_to_seven: number | string;
          gt_7d: number | string;
        }>(),
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM clinical_followups WHERE status = 'OPEN' AND due_at < ?",
        )
        .bind(end)
        .first<CountRow>(),
      db
        .prepare('SELECT COUNT(*) AS count FROM animals WHERE archived_at IS NULL')
        .first<CountRow>(),
      db
        .prepare('SELECT COUNT(*) AS count FROM holdings WHERE archived_at IS NULL')
        .first<CountRow>(),
      db
        .prepare('SELECT COUNT(*) AS count FROM animal_groups WHERE archived_at IS NULL')
        .first<CountRow>(),
      db
        .prepare(
          `SELECT
            COUNT(*) AS completed,
            COUNT(DISTINCT CASE WHEN v.weight_kg IS NOT NULL THEN e.id END) AS with_weight,
            COUNT(DISTINCT CASE WHEN v.encounter_id IS NOT NULL THEN e.id END) AS with_vitals,
            COUNT(DISTINCT CASE WHEN d.encounter_id IS NOT NULL THEN e.id END) AS with_diagnosis
          FROM encounters e
          LEFT JOIN encounter_vitals v ON v.encounter_id = e.id
          LEFT JOIN diagnoses d ON d.encounter_id = e.id
          WHERE e.status = 'COMPLETED' AND e.completed_at >= ?`,
        )
        .bind(sevenDays)
        .first<{
          completed: number | string;
          with_weight: number | string;
          with_vitals: number | string;
          with_diagnosis: number | string;
        }>(),
      db
        .prepare(
          `SELECT
            SUM(CASE WHEN dose_value IS NOT NULL AND dose_unit IS NOT NULL THEN 1 ELSE 0 END) AS structured,
            SUM(CASE WHEN dose_value IS NULL AND dose_text IS NOT NULL THEN 1 ELSE 0 END) AS free_text
          FROM medication_records WHERE created_at >= ?`,
        )
        .bind(sevenDays)
        .first<{ structured: number | string; free_text: number | string }>(),
      db
        .prepare(
          `SELECT COUNT(*) AS count
          FROM audit_events a
          JOIN encounters e ON e.id = a.entity_id
          WHERE a.entity_type = 'ENCOUNTER'
            AND a.action = 'ENCOUNTER_UPDATED'
            AND e.status = 'COMPLETED'
            AND a.created_at >= ?
            AND a.created_at > e.completed_at`,
        )
        .bind(sevenDays)
        .first<CountRow>(),
    ]);

  return {
    OPEN_DRAFTS_TOTAL: count(drafts && { count: drafts.total }),
    OPEN_DRAFTS_LT_1D: count(drafts && { count: drafts.lt_1d }),
    OPEN_DRAFTS_1_3D: count(drafts && { count: drafts.one_to_three }),
    OPEN_DRAFTS_3_7D: count(drafts && { count: drafts.three_to_seven }),
    OPEN_DRAFTS_GT_7D: count(drafts && { count: drafts.gt_7d }),
    OVERDUE_FOLLOWUPS_TOTAL: count(followups),
    ACTIVE_ANIMALS_TOTAL: count(animals),
    HOLDINGS_TOTAL: count(holdings),
    ANIMAL_GROUPS_TOTAL: count(groups),
    ENCOUNTERS_COMPLETED_7D: count(encounters && { count: encounters.completed }),
    ENCOUNTERS_WITH_WEIGHT_7D: count(encounters && { count: encounters.with_weight }),
    ENCOUNTERS_WITH_VITALS_7D: count(encounters && { count: encounters.with_vitals }),
    ENCOUNTERS_WITH_DIAGNOSIS_7D: count(encounters && { count: encounters.with_diagnosis }),
    MEDICATIONS_STRUCTURED_7D: count(medications && { count: medications.structured }),
    MEDICATIONS_FREE_TEXT_ONLY_7D: count(medications && { count: medications.free_text }),
    POST_COMPLETION_CORRECTIONS_7D: count(corrections),
  };
}
