# ADR-M12: privacy-first measurement

Status: accepted, provider-ready (no provider identifier is configured in this milestone).

## Decision

Use a small typed event adapter with a Plausible-compatible production provider. It is enabled only when `PUBLIC_PLAUSIBLE_DOMAIN` is present, `DEPLOYMENT_TARGET=production`, and `SITE_INDEXABLE=true`. Therefore the temporary public origin remains noindex and sends no production analytics. Development, preview, Studio, staging, and tests are no-op.

Plausible was selected because its current documentation describes a lightweight script, custom events, no cookies, no persistent identifiers, and no consent banner. It supports UTM attribution and custom properties. See [Plausible docs](https://plausible.io/docs) and [custom events](https://plausible.io/docs/custom-event-goals). Cloudflare Web Analytics is a useful free performance/RUM option, but does not provide the required stable custom business-event vocabulary; GA4 is paid-ready but adds cookie/consent and governance complexity. A custom analytics service is disproportionate for M12.

## Privacy and operations

Only allowlisted scalar properties are sent. No DOM, query string, form data, free text, contact payload, identity, medical detail, exact location, or document is serialized. Tracking is passive and failures are swallowed so links remain immediate. The adapter is intentionally small so a later provider change does not touch business links.

The only new external origin is `https://plausible.io`, permitted narrowly in CSP. It is not requested until a real site identifier is supplied. Cost is zero at the current configuration; any later paid plan requires owner approval.
