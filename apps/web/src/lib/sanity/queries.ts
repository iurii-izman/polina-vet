import { defineQuery } from 'groq';

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    title,
    defaultLanguage
  }
`);

export const ARTICLE_PATHS_QUERY = defineQuery(`
  *[_type == "article" && language == "ru" && defined(slug.current) && defined(primaryDomain) && !archived && defined(title)]
  { "slug": slug.current, language, primaryDomain }
`);

export const ARTICLE_DETAIL_QUERY = defineQuery(`
  *[_type == "article" && language == $language && primaryDomain == $primaryDomain && slug.current == $slug][0]{
    _id, title, summary, "slug": slug.current, language, translationGroupId, primaryDomain,
    medicalOwner->{ _id, name, role }, reviewedBy->{ _id, name, role }, riskLevel,
    medicalRevision, sourceMedicalRevision, lastMedicalReview, reviewIntervalMonths,
    sources[]->{ _id, title, url, status, jurisdiction, identifier, supersededBy->{ _id, title, url } },
    species[]->{ _id, name }, topics[]->{ _id, name }, body[]{ _key, _type, ..., children[]{ _key, _type, text, marks, markDefs } },
    archived, withdrawn, replacement->{ _id, title, "slug": slug.current, primaryDomain, language },
    translatedFrom->{ _id, medicalRevision }, previousSlugs, seoTitle, seoDescription
  }
`);

/** Structural candidates; review expiry is filtered by the canonical TS governance helper. */
export const ELIGIBLE_KNOWLEDGE_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !archived && !withdrawn && language == $language &&
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
    "sourceCurrentMedicalRevision": translatedFrom->medicalRevision
  }
`);
