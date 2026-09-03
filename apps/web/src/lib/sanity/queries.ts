import { defineQuery } from 'groq';

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    title,
    defaultLanguage
  }
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
