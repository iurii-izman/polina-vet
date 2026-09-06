# M13 Product Spec — Intake & Lightweight CRM

M13 creates a private operational record for every meaningful inquiry. The central entity is `Inquiry`; clients, animals, farms, visits, treatments, appointments, payments, uploads, chat ingestion, and AI triage are explicitly out of scope.

Users are Polina and a technical administrator/assistant. Both roles have full inquiry access in M13, while the authorization helper preserves future separation into `CLINICIAN` and `TECH_ADMIN`. The primary device is an Android phone; desktop supports denser list/detail work.

Statuses: `NEW`, `IN_PROGRESS`, `WAITING`, `FOLLOW_UP`, `CLOSED`. Closing requires a separate outcome, with `visit_at_site` first in the Office UI. Closed inquiries can be reopened.

Public intake is a short Pets/Farm flow at `/ru/contact/request/`, `/ro/contact/request/`, and `/uk/contact/request/`. Address is optional. The route is always noindex. It is disabled by default with `PUBLIC_INTAKE_ENABLED=false`.

Required operational capabilities: list, detail, Quick Add, status, follow-up presets (today/tomorrow/+3 days/custom API), last contact, notes, audit events, filters/search, retention, and a narrow Telegram notification adapter that excludes PII.

Retention is 12 months after closure for standalone M13 inquiries. Uploads are off. M14 has not started.
