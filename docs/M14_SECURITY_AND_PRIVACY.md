# M14 Security and Privacy Boundary

M14 private data remains in the authenticated Office Worker and operations D1 only.

- Cloudflare Access remains the authentication boundary.
- Server code derives `actor` and `actor_role` from the Access identity.
- Office/API responses retain `no-store`, `noindex`, frame, referrer, and CSP headers.
- Request bodies, Access tokens, cookies, clinical text, contact details, and medication instructions are excluded from logs.
- Clinical data is not sent to Sanity, public analytics, Telegram, static builds, localStorage, or IndexedDB.
- Search covers operational identifiers and labels but not clinical narrative.
- Opaque IDs are used for internal routes; PII is not placed in query strings.
- M13 Inquiry retention remains 365-day standalone retention. Its deletion sets the optional clinical source link to null and leaves M14 records intact.
- No client-side clinical draft persistence or offline synchronization is implemented.

M14 is a recordkeeping layer. Validation checks shape, length, enum, numeric, date, and relation integrity only; it does not diagnose, recommend treatment, infer dose, or perform triage.
