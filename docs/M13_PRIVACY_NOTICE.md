# M13 Privacy / Personal Data Notice

**Version:** 1.0
**Approval date:** 2026-09-06
**Canonical public routes:** `/ru/privacy/v1.0/`, `/ro/privacy/v1.0/`, `/uk/privacy/v1.0/`

The public notice is rendered by `apps/web/src/components/PrivacyNotice.astro`. The Russian version is canonical; Romanian and Ukrainian versions are faithful localized versions in the existing route architecture.

The form consent is a required, non-prechecked acknowledgement linked directly to the versioned route. It records `privacyNoticeVersion = 1.0` and the acknowledgement timestamp in the private Inquiry record. There is no marketing consent.

The public Intake feature remains disabled until the external activation prerequisite documented in [M13 PMR Privacy Check](M13_PMR_PRIVACY_CHECK.md) is completed.
