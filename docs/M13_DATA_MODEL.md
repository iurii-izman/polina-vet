# M13 Data Model

## `inquiries`

Opaque internal `id` plus stable non-sequential `public_ref` (`PV-XXXXXXXX`); timestamps; locale; `PET`/`FARM` domain; source; acquisition source; contact and preferred contact channel; name/contact/locality; optional address; species/context; reason; short summary; status/outcome; assignment; follow-up and last-contact timestamps; closure/retention; privacy notice version/timestamp; allowlisted UTM fields; unique idempotency key.

## `inquiry_notes`

Separate short internal notes: id, inquiry id, body, created timestamp, created actor. Notes are operational context, not a medical record.

## `inquiry_events`

Controlled event type, inquiry id, actor, small controlled metadata object, timestamp. Event metadata never duplicates submitted PII.

## `notification_deliveries`

Channel, delivery status, error category, timestamp, inquiry id. The Telegram adapter contains only reference/domain/locality and an Office link.

Indexes cover created time, status, follow-up, domain, assignment, source, notes, and events. There are deliberately no client/animal/farm/visit/medical/billing/calendar tables.

Closed standalone inquiries have a 365-day `retention_until` from closure. Earlier deletion/correction is handled through the protected manual process in [M13 privacy operations](M13_PRIVACY_OPERATIONS.md), unless continued storage is required by applicable law or is reasonably necessary to resolve an active dispute/request.
