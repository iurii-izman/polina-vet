import { defineQuery } from 'groq';

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    title,
    defaultLanguage
  }
`);

export const PUBLIC_PROFILE_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    title,
    defaultLanguage,
    primaryAuthor->{
      _id, name, role, "slug": slug.current, position, shortBio,
      bio[]{ _key, _type, ..., children[]{ _key, _type, text, marks, markDefs } },
      education[]{ institution, field, qualification, note },
      portrait{ asset, alt, crop, hotspot, "dimensions": asset->metadata.dimensions }
    },
    contacts{ primaryPhone, secondaryPhone, telegramHandle, whatsappPhone, viberPhone },
    location{ label, mapUrl },
    serviceModes,
    availabilityNote,
    "featuredKnowledge": featuredKnowledge[]->{
      _id, title, summary, "slug": slug.current, language, primaryDomain,
      riskLevel, medicalOwner, reviewedBy, medicalRevision, lastMedicalReview,
      reviewIntervalMonths, "sourceStatuses": sources[]->status, withdrawn, archived
    }
  }
`);

export const ARTICLE_PATHS_QUERY = defineQuery(`
  *[_type == "article" && language in ["ru", "ro", "uk"] && defined(slug.current) && defined(primaryDomain) && !archived && defined(title)]
  { "slug": slug.current, language, primaryDomain, withdrawn, translationGroupId, sourceMedicalRevision, "sourceCurrentMedicalRevision": translatedFrom->medicalRevision }
`);

export const ARTICLE_ALTERNATES_QUERY = defineQuery(`
  *[_type == "article" && translationGroupId == $translationGroupId && !archived && !withdrawn && language in ["ru", "ro", "uk"] && defined(slug.current)]
  { "slug": slug.current, language, primaryDomain, sourceMedicalRevision, "sourceCurrentMedicalRevision": translatedFrom->medicalRevision }
`);

export const ARTICLE_DETAIL_QUERY = defineQuery(`
  *[_type == "article" && language == $language && primaryDomain == $primaryDomain && slug.current == $slug][0]{
    _id, title, summary, "slug": slug.current, language, translationGroupId, primaryDomain,
    medicalOwner->{ _id, name, role }, reviewedBy->{ _id, name, role }, riskLevel,
    medicalRevision, sourceMedicalRevision, lastMedicalReview, reviewIntervalMonths,
    sources[]->{ _id, title, url, status, jurisdiction, identifier, supersededBy->{ _id, title, url } },
    species[]->{ _id, name }, topics[]->{ _id, name }, body[]{ _key, _type, ..., children[]{ _key, _type, text, marks, markDefs } },
    archived, withdrawn, replacement->{ _id, title, "slug": slug.current, primaryDomain, language },
    translatedFrom->{ _id, language, medicalRevision }, previousSlugs, seoTitle, seoDescription
  }
`);

/** Structural candidates; review expiry is filtered by the canonical TS governance helper. */
export const ELIGIBLE_KNOWLEDGE_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !archived && !withdrawn && language == $language &&
    defined(primaryDomain) && primaryDomain in ["pet", "farm", "shared"] &&
    defined(title) && defined(summary) && defined(medicalOwner) && defined(riskLevel) &&
    defined(medicalRevision) && defined(lastMedicalReview) && defined(reviewIntervalMonths) && count(sources) > 0 && count(body) > 0 &&
    !(riskLevel == "HIGH" && !defined(reviewedBy))]
  { _id, title, summary, "slug": slug.current, language, primaryDomain, riskLevel, medicalOwner, reviewedBy,
    lastMedicalReview, reviewIntervalMonths, "sourceStatuses": sources[]->status }
`);

export const PAGE_BY_TRANSLATION_GROUP_QUERY = defineQuery(`
  *[
    _type == "page" &&
    translationGroupId == $translationGroupId &&
    language == $language &&
    defined(slug.current)
  ][0]{
    _id,
    title,
    "slug": slug.current,
    language,
    translationGroupId,
    body
  }
`);

/** Contract for future medical translation rendering; no public article route exists yet. */
export const ARTICLE_TRANSLATION_STATE_QUERY = defineQuery(`
  *[
    _type == "article" &&
    translationGroupId == $translationGroupId &&
    language == $language &&
    defined(slug.current)
  ][0]{
    _id,
    language,
    translationGroupId,
    "slug": slug.current,
    "translationSourceMedicalRevision": sourceMedicalRevision,
    "sourceCurrentMedicalRevision": translatedFrom->medicalRevision,
    withdrawn
  }
`);
