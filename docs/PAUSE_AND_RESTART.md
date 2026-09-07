# Development Pause and Restart Contract

## Pause state

M1–M14.5 is closed for this implementation cycle. The site is in real-world observation readiness, not a promise of ongoing development. M15 and M16 are not started, and no later milestone is implied.

Allowed while paused:

- production incident response and safe rollback/recovery;
- owner-controlled R1/R2/R3 external setup;
- routine Sanity editorial governance that preserves medical review rules;
- security fixes and dependency fixes necessary to keep the deployed system safe;
- evidence collection that does not add synthetic observation data or private patient data.

Not allowed without a new explicit request:

- new product features, new IA, new verticals, or a new workflow;
- enabling Intake, Access bypass, public analytics, or unapproved notifications;
- M15/M16 design or implementation;
- legal, clinical, availability, or ownership claims based on placeholders;
- a new datastore, CRM, AI diagnosis path, or integration “for later.”

## Restart gate

Before any new milestone:

1. Read `PROJECT_STATUS.md`, this file, the frozen product documents, and relevant ADRs.
2. Run the `milestone-start` process and confirm the current `main` ancestry and clean user work.
3. State the exact milestone objective, data boundary, external dependencies, rollback plan, and success evidence.
4. Obtain explicit owner approval for any change to production flags, Access, notifications, legal gates, public analytics, or medical content.
5. Create a feature branch from current `main`; do not continue from the historical closure branch.
6. Use the applicable domain skills, then run `preflight` before merge.

## Observation rule

The M14.5 observation period starts only after Office is protected and the first genuine production `REAL` telemetry event is observed. Synthetic acceptance events are labelled `SYNTHETIC` and must be cleaned; they never create a fake start date.
