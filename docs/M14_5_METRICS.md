# M14.5 Metrics

All percentages require numerator, denominator, time window, sample size, and confidence. Staging/synthetic events are excluded from real-usage conclusions.

| Metric | Numerator | Denominator | Window / source | Limit |
|---|---|---|---|---|
| `SEARCH_ZERO_RESULT_RATE` | `SEARCH_EXECUTED` with result bucket `ZERO` | all `SEARCH_EXECUTED` | selected period / Analytics Engine | Measures retrieval friction, not user intent |
| `ENCOUNTER_COMPLETION_DURATION` | completed encounter workflow duration | completed encounters | selected period / server timestamps | Small samples are descriptive only |
| `DRAFT_SAVE_FREQUENCY` | `ENCOUNTER_DRAFT_SAVED` | started encounters | selected period | Does not measure clinician performance |
| `POST_COMPLETION_CORRECTION_RATE` | completed encounters corrected later | completed encounters | selected period / audit-derived snapshot | A correction is not a clinical-quality judgment |
| `FOLLOWUP_LATE_RATE` | late follow-ups | all due follow-ups | selected period | Report late/total, with lateness bucket |
| `STRUCTURED_MEDICATION_RATE` | structured dose records | all medication records | selected period / structural event | Does not assess treatment |
| `ENCOUNTER_WEIGHT_RATE` | completed encounters with weight | completed encounters | 7-day snapshot | Structural completeness only |
| `ENCOUNTER_VITALS_RATE` | encounters with vitals | completed encounters | 7-day snapshot | Structural completeness only |
| `ENCOUNTER_DIAGNOSIS_RATE` | encounters with a diagnosis record | completed encounters | 7-day snapshot | Does not assess diagnosis correctness |

Daily snapshots additionally store bounded counts for open-draft age buckets, overdue follow-ups, active animals, holdings, groups, completed encounters, medication structure, and post-completion corrections.
