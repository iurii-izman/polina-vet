# POLINA VET — Medical Content Safety v1.0

This document governs public-site medical content and related implementation.

## Core principle

POLINA VET helps users understand urgency, safe next steps, preparation, and reliable veterinary information. It is not a public self-treatment engine.

## Public owner-facing boundaries

Do not introduce by default:
- individualized diagnosis;
- owner-facing prescription treatment schemes;
- owner-facing medication dose calculators;
- dosing instructions that encourage unsafe self-treatment;
- AI symptom diagnosis;
- binary “safe / not safe” triage.

## Urgent

Global `/urgent/` is only a Pet/Farm gateway.

Urgent pages must:
- state that listed red flags are not exhaustive;
- avoid implying absence of red flags equals safety;
- provide safe immediate operational guidance where reviewed;
- separate “how to get veterinary help” from Polina's personal availability;
- state clearly that POLINA VET is not a 24/7 emergency service unless that becomes factually true;
- not force users to scroll to the end before seeing the help/availability boundary.

## Medical review model

Required stored facts for public medical content:
- `medicalOwner`
- `riskLevel`
- `medicalRevision`
- `lastMedicalReview`
- `reviewInterval`
- `sources[]`

Independent `reviewedBy` is conditional/risk-based.

Risk levels:
- HIGH
- STANDARD
- LOW

The exact cadence is risk/change-sensitive, not ceremonial.

## Translations

A translation's medical freshness follows `medicalRevision`, not ordinary Sanity document revision.

If the source receives a medically meaningful change:
- dependent translations may become `REVIEW_REQUIRED`.

Do not silently serve stale medical translation as current.

## Sources

Preferred hierarchy:
1. official drug label / official regulation;
2. veterinary guideline or consensus;
3. peer-reviewed literature;
4. recognized veterinary reference manual.

Do not base clinical claims on stores, forums, SEO articles, or random blogs.

Source entities should support lifecycle such as:
- current
- superseded
- withdrawn
- supersededBy

## Clinical cases

Do not invent cases.

Public cases must be anonymized.
Do not store private consent artifacts in the public CMS.
CMS may store only verification/status references.

Check images/content for:
- names/phones;
- addresses;
- faces;
- vehicle/license identifiers;
- farm/business identifiers;
- documents in frame;
- EXIF/GPS;
- unusual identifying context.

## Implementation behavior

A high-risk stale/withdrawn page must not become a dead-end 404 if a safer current replacement or urgent route exists.

Internal editorial states should not leak CMS jargon to users.
Use human-facing labels such as:
- “Перевод требует обновления”
rather than:
- `REVIEW_REQUIRED`
- `medicalRevision CURRENT`
