import { defineQuery } from 'groq';

export const publishedArticlePathsQuery = defineQuery(/* groq */ `
  *[_type == "article" && language == "ru" && defined(slug.current) && !archived && !withdrawn &&
    defined(title) && defined(summary) && defined(medicalOwner) && defined(riskLevel) &&
    defined(medicalRevision) && defined(lastMedicalReview) && defined(reviewIntervalMonths) && count(sources) > 0 && count(body) > 0]
  { "slug": slug.current, language, primaryDomain }
`);

export const publishedArticleDetailQuery = defineQuery(/* groq */ `
  *[_type == "article" && language == $language && slug.current == $slug][0]{
    _id, title, summary, "slug": slug.current, language, translationGroupId, primaryDomain,
    medicalOwner->{ _id, name, role }, reviewedBy->{ _id, name, role }, riskLevel,
    medicalRevision, sourceMedicalRevision, lastMedicalReview, reviewIntervalMonths, reviewNotes,
    sources[]->{ _id, title, url, status, jurisdiction, identifier, supersededBy->{ _id, title, url } },
    species[]->{ _id, name }, topics[]->{ _id, name }, body[]{ _key, _type, ..., children[]{ _key, _type, text, marks, markDefs } },
    archived, withdrawn, replacement->{ _id, title, "slug": slug.current, primaryDomain, language },
    translatedFrom->{ _id, medicalRevision }, previousSlugs, seoTitle, seoDescription
  }
`);

export const eligibleKnowledgeQuery = defineQuery(/* groq */ `
  *[_type == "article" && defined(slug.current) && !archived && !withdrawn && language == $language &&
    !(riskLevel == "HIGH" && (withdrawn == true || !defined(lastMedicalReview) || count(sources[@->status in ["withdrawn"]]) > 0))]
  | order(title asc){ _id, title, summary, "slug": slug.current, language, primaryDomain }
`);
