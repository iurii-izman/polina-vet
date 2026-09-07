# M14.5 Analytics Engine Query Cookbook

These queries use only fixed safe blobs/doubles. In the dataset, blobs are ordered as `schema_version, event_name, environment, service, release, route_class, domain, subject_type, encounter_type, operation, result, error_code, source, data_origin, metric_name`; doubles are `duration_ms, workflow_duration_ms, result_count, changed_field_count, validation_error_count, metric_value`.

Replace `polina_vet_learning_staging` with the production dataset only after production activation is authorized.

```sql
-- Errors in the last 7 days
SELECT blob10 AS operation, blob12 AS error_code, COUNT(*) AS events
FROM polina_vet_learning_staging
WHERE timestamp > NOW() - INTERVAL '7' DAY AND blob11 = 'FAILURE'
GROUP BY operation, error_code ORDER BY events DESC;

-- Search zero-result rate (the implementation records the numeric result count)
SELECT SUM(CASE WHEN double3 = 0 THEN 1 ELSE 0 END) / COUNT(*) AS zero_result_rate
FROM polina_vet_learning_staging
WHERE blob2 = 'SEARCH_EXECUTED' AND timestamp > NOW() - INTERVAL '30' DAY;

-- Encounter completion duration by safe encounter type
SELECT blob9 AS encounter_type,
       quantileExactWeighted(0.50)(double2, _sample_interval) AS p50_ms,
       quantileExactWeighted(0.95)(double2, _sample_interval) AS p95_ms
FROM polina_vet_learning_staging
WHERE blob2 = 'ENCOUNTER_COMPLETED' AND double2 > 0
GROUP BY encounter_type;

-- Daily snapshot trends
SELECT timestamp, blob15 AS metric, double6 AS value
FROM polina_vet_learning_staging
WHERE blob2 = 'DAILY_SNAPSHOT' ORDER BY timestamp;

-- Release comparison for safe operations
SELECT blob5 AS release, blob10 AS operation, COUNT(*) AS events
FROM polina_vet_learning_staging
WHERE timestamp > NOW() - INTERVAL '30' DAY
GROUP BY release, operation ORDER BY release, events DESC;
```

Queries for correction rate, follow-up lateness, structured medication usage, and encounter completeness should use the corresponding event or daily snapshot metric with explicit numerator/denominator reporting. Do not join telemetry to clinical rows and do not query narrative D1 columns here.
