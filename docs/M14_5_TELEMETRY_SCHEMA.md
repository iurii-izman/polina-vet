# M14.5 Telemetry Schema

Schema version: `1`.

Every event has: `schema_version`, `event_name`, `environment`, `service`, `release`, and server-derived `data_origin`.

Controlled optional dimensions: `route_class`, `domain`, `subject_type`, `encounter_type`, `operation`, `result`, `error_code`, `source`, and `metric_name` for daily snapshots.

Numeric slots: `duration_ms`, `workflow_duration_ms`, `result_count`, `changed_field_count`, `validation_error_count`, and `metric_value`.

The adapter rejects unknown fields, rejects invalid enum values and non-finite/negative numbers, and serializes only fixed Analytics Engine blob/double positions. It never accepts clinical payloads, IDs, request IDs, actor identity, search text, or arbitrary objects.

`data_origin` is server-controlled: staging is `SYNTHETIC`; production is `REAL`; scheduled system events retain the environment boundary.
