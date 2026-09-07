# M14.5 Privacy Boundary

## Allowed

Enums, booleans, counts, durations, buckets, safe error codes, release, environment, route classes, domain, subject type, encounter type, and aggregate structural signals.

## Restricted outside telemetry

Request IDs, entity IDs, actor identity, and audit correlation belong only in operational/audit systems.

## Prohibited from product telemetry and custom logs

PII, contact values, locations, clinical narrative, diagnosis/drug/vaccine names, dose text or values, notes, search text, raw URLs/query strings, request bodies, tokens, cookies, IPs, user agents, and secrets.

There is no session replay, DOM recording, keystroke tracking, heatmap, or custom telemetry dashboard. Unexpected server and client exceptions become controlled error codes; raw messages and stacks are not copied.

The required canary workflow must report zero occurrences across accessible logs, Analytics Engine events, client events, and traces. Authenticated staging inspection is an operational acceptance step and must not expose secrets.
