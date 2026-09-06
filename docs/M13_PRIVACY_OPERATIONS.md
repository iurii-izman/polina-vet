# M13 privacy request and retention procedure

This is the lightweight authenticated/manual procedure for the two approved Inquiry operators: Polina and the technical administrator.

## Request intake

Privacy requests go to `lina.vet@gmail.com`. Do not ask a person to put identity documents, human medical information, passwords, payment/card data, or other unnecessary sensitive data into the public Intake form.

The operator records only a request reference, date, request type, safe Inquiry identifier if supplied, identity-verification result, decision, action date, and responsible operator. Use the protected Office and D1 administration path; never use Sanity, analytics, Telegram, or a public read endpoint for a request.

## Access

1. Verify the requester through a controlled channel before disclosing personal data. Do not disclose another person’s record.
2. Locate the Inquiry by `public_ref` or another safe identifier in protected Office.
3. Provide only the requested record and the Article 14 information relevant to its processing: purpose, fields/source, access, processor/infrastructure information, and retention.
4. Record the response and close the request.

## Correction

Verify the requester, locate the Inquiry, correct only the confirmed fields, and record the action in the protected operational procedure. If the data are disputed, restrict use while checking the request and do not alter unrelated fields.

## Deletion or withdrawal

Verify the requester and locate the Inquiry by `public_ref`. If no overriding legal or operational reason requires continued storage, perform a deliberate D1 delete by `public_ref`; the schema’s foreign keys cascade to notes, events, and notification-delivery rows. If a valid withdrawal applies, stop processing and delete promptly rather than waiting for retention expiry. Record the result outside the deleted Inquiry using the request reference and action metadata only.

If continued storage is required by applicable law or is reasonably necessary to resolve an active dispute/request, document that narrow reason, restrict access, and set a follow-up review. Do not create an indefinite legal-hold category.

## Scheduled retention

At closure, the system sets `retention_until` to 365 days after the closure timestamp. The daily UTC Office Cron runs a dry-run-equivalent query and deletes only `CLOSED` rows whose `retention_until` has passed. Deletion evidence follows the current destruction-confirmation requirements; no production data is copied into tests or CI.
