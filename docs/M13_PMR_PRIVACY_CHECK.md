# M13 narrow PMR personal-data check

**Checked:** 2026-09-06
**Scope:** the small public Pets/Farm Intake flow, its Cloudflare Workers/D1 operations store, protected Office, and PII-free Telegram notifications. This is a focused product gate, not a broad legal opinion.

## Official sources checked

- [PMR Ministry of Justice official publication register](https://www.minjust.gospmr.org/web.nsf/All/publication2?Count=1000&ExpandView=&OpenDocument=&Start=1.3), including Law No. 150-ZI-VIII of 2026-07-01 and Law No. 173-ZID-VIII of 2026-07-23.
- [Official publication of Law No. 150-ZI-VIII](https://www.minjust.gospmr.org/oo/Publication.nsf/805c7c76d1c2ddb8c2258213005be80f/60ffec9df15b6b59c2258e270049a26a!OpenDocument).
- [Official publication of Law No. 173-ZID-VIII](https://www.minjust.gospmr.org/oo/Publication.nsf/805c7c76d1c2ddb8c2258213005be80f/9261e50472af7d8fc2258e3d003f94b5!OpenDocument).
- [Current consolidated text of Law No. 53-Z-IV “On Personal Data”](https://pravo.pmr-online.com/View.aspx?id=zAEqIEFv21B3Oh99asfXBQ%3d%3d), current revision shown as No. 14 from 2026-07-24 and incorporating the 2026 amendments.
- [Official publication of the 2026 requirements for confirming personal-data destruction](https://www.minjust.gospmr.org/web.nsf/All/publication2%21OpenDocument%26Start%3D1%26Count%3D200%26Expand%3D1.2%26TableRow%3D1.1), checked for the retention/deletion evidence boundary.

## Classification

### A. Satisfied by current design

- **Operator identity:** Article 3(b) defines an operator as a legal or physical person that determines the purpose, data composition, and processing operations. The approved responsible person is `Изман Полина Андреевна / POLINA VET`; the notice does not describe POLINA VET as a separate incorporated entity.
- **Consent:** current Article 9 requires consent to be specific, informed, conscious, and unequivocal, in a form that can confirm receipt. The form uses a required, non-prechecked checkbox, a direct notice link, version `1.0`, and a stored acknowledgement timestamp.
- **Purpose limitation and minimization:** Article 5 limits processing to concrete lawful purposes and data that are not excessive. Intake fields are limited to contact coordination, basic animal context, operational follow-up, controlled campaign fields, and necessary security/idempotency metadata. Human medical data, identity documents, payment data, passwords, uploads, and photos are excluded.
- **Confidentiality and security:** Articles 18-1 and 19 require organizational and technical measures. The design uses isolated D1, server-side Turnstile, exact origin/CORS policy, rate limiting, honeypot, idempotency, parameterized SQL, Access JWT validation, `no-store` Office responses, and PII-free Telegram notifications.

### B. Can be satisfied in product/docs now

- **Notice information:** the public versioned notice identifies the responsible person, contact, purposes, fields, access, Cloudflare infrastructure, Telegram boundary, retention, rights route, and security/minimization limits.
- **Subject rights:** Articles 14 and 20 provide access and information rights; Article 21 requires correction/blocking/deletion handling. The documented manual process uses authenticated Office/admin lookup by safe identifiers and deliberate action, without a self-service privacy portal.
- **Withdrawal:** Article 9(2) permits withdrawal. The operational procedure treats a valid withdrawal as a prompt stop/deletion request and does not defer it to the 365-day retention sweep.
- **Retention:** the product declares up to 365 days after standalone closure, with earlier deletion/correction when requested, unless continued storage is required by applicable law or is reasonably necessary to resolve an active dispute/request. Active inquiries remain only while operationally necessary.
- **Cloudflare/D1 location and cross-border disclosure:** Article 22(3) requires an operator notification to state whether cross-border transfer exists and where the database is located. The product can record those facts in the notification and disclose Cloudflare Workers/D1 in the public notice. No separate database-location prohibition or pre-activation cloud filing was found in the checked sources.

### C. External mandatory action

**YES — prior operator notification is required before public Intake processing.**

Current Article 22(1) states that an operator must notify the authorized body for protection of personal-data subjects **before beginning processing**, unless an Article 22(2) exception applies. The Intake flow is a public pre-contract inquiry: it is not an already concluded contract, is not a name-only list, and is not one of the other listed exceptions. Explicit consent does not itself appear in the Article 22(2) exceptions.

The notification must include the operator identity/address, purpose, data categories, subject categories, legal basis, processing operations, security measures, start date, end condition, cross-border-transfer status, security information, and database location. Article 22(7) requires updates within 10 working days after a change or cessation.

**Concrete action:** before enabling real public Intake, submit the operator’s Article 22 notification to the authorized personal-data-rights body, including the actual Cloudflare/D1 location and cross-border-transfer facts, and retain the submission/registration evidence. Until that is done, `PUBLIC_INTAKE_ENABLED=false` remains mandatory.

This is the single activation blocker. It is not a request for generic lawyer approval.

## Gate result

**LEGAL PRODUCT GATE: FAIL / EXTERNAL PREREQUISITE OPEN**

The M13 implementation and privacy documentation can be closed, and production infrastructure can be provisioned fail-closed, but real public Intake activation must wait for the Article 22 notification evidence.
