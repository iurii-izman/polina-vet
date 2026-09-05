# R2 — External Channels & Growth Activation

**Status:** OPEN / WAITING FOR OWNER-CONTROLLED EXTERNAL ACCOUNTS

R2 is a release/activation gate, not a product milestone. It does not block M12 closure or M13–M18. It tracks only owner-controlled accounts, ownership decisions, and provider activation.

## Dependencies

- Viber official contact or validated deep link;
- Instagram profile URL;
- Facebook page/profile URL;
- WhatsApp contact URL or number, if used;
- TikTok URL, if created;
- YouTube URL, if created;
- Google Business Profile URL/ID after eligibility and ownership are resolved;
- Plausible account/site/domain configuration if analytics collection is activated;
- any future verified social profile intended for public display.

Current verified project values remain canonical and are not R2 blockers: Telegram, phone, and map/location are CURRENT.

## Relation to R1

R1 is Final Domain & Public Launch Activation. R2 is External Channels & Growth Activation. They are independent but related: external profiles may be prepared before R1, while permanent website references and Google Business website URLs should preferably use `lina.vet` after R1. Plausible activation requires an explicit opt-in and never follows from `SITE_INDEXABLE`.

R2 must not enable indexing, change Preview/Studio/staging access, or alter the temporary noindex policy.

Tracking issue: [#12](https://github.com/iurii-izman/polina-vet/issues/12).

## Activation rule

Each channel is added only after an owner supplies and verifies the canonical value. Until then, the frontend fails closed: no placeholder, empty social icon, or `#` link is rendered. Google Business and Plausible remain uncreated/unconfigured until their respective ownership and provider gates are satisfied.
