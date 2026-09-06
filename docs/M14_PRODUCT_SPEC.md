# M14 Veterinary Operations Core

M14 extends the private Office and operations D1 from Inquiry handling to a small, recordkeeping-first clinical workflow.

## Scope

- Clients and structured contacts.
- Holdings, individual PET/FARM animals, and FARM animal groups.
- Draft/completed encounters: `AT_SITE`, `FIELD_VISIT`, `REMOTE`.
- Clinical record text, one structured vitals set, and farm population context.
- Diagnoses, lightweight medication records with free-text fallback, procedures, vaccinations, clinical follow-ups, patient alerts, and audit events.
- D1-native search without clinical narrative indexing.

Both current Access identities retain the same M14 capability boundary. The authenticated Access identity is always the audit actor; the browser cannot select an actor or role.

## Explicit exclusions

No public Intake activation, AI/decision support, drug formulary, dose inference, uploads, offline storage, billing, inventory, telemetry dashboards, or M14.5 implementation.

`PUBLIC_INTAKE_ENABLED` remains `false` in the existing Worker configuration.
