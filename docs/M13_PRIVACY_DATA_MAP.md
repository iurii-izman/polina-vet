# M13 Privacy Data Map

This is an implementation map, not a legal conclusion. The canonical public notice is version `1.0`; the remaining activation gate is the specific Article 22 operator-notification prerequisite documented in `M13_PMR_PRIVACY_CHECK.md`.

| Data | Why | Store | Access | Retention/handling |
|---|---|---|---|---|
| Name, contact, locality | Respond to and operate an inquiry | Private D1 inquiry row | Access-authenticated Office users | Deleted with expired standalone inquiry |
| Optional address | Future field-visit coordination | Private D1 inquiry row | Detail only | Optional; never required for submit |
| Species, reason, short summary | Operational context for next contact | Private D1 inquiry row | Access-authenticated Office users | Not a diagnosis or medical record |
| Locale and allowlisted UTM values | Response context and campaign attribution | Private D1 inquiry row | Office; no public analytics payload | Same inquiry retention |
| Notes and audit actor | Operational continuity and accountability | Private D1 notes/events | Access-authenticated Office users | Cascades with inquiry |
| Public reference | User-facing confirmation and operational lookup | D1; response only returns reference | User gets own reference; Office users see it | Same inquiry retention |

No inquiry PII is sent to Sanity, Plausible, browser storage, service-worker caches, logs, or Telegram notifications. Logs allow only request id, public reference, operation, status, latency, count, and error category. Exact address and contact are excluded from notification text.

Manual hard delete is not exposed in the initial UI; legitimate deletion remains a protected operational procedure until a reviewed confirmation workflow is added. Uploads are off. Future M14 transition requires a new reviewed data model and policy.
