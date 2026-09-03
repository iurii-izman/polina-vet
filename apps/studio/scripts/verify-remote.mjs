import { createClient } from '@sanity/client';

import { validateContent } from '../../../scripts/validate-content.mjs';
import { SANITY_API_VERSION } from '../../../sanity.shared.ts';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId || !dataset)
  throw new Error('SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET are required.');

const client = createClient({
  projectId,
  dataset,
  apiVersion: SANITY_API_VERSION,
  useCdn: false,
  perspective: 'published',
});

const [siteSettings, editorialPolicy, articles, documents] = await Promise.all([
  client.fetch('*[_type == "siteSettings" && _id == "siteSettings"][0]{_id,title,defaultLanguage}'),
  client.fetch('*[_type == "page"]{_id,language,translationGroupId,"slug":slug.current}'),
  client.fetch(`*[_type == "article"]{
    "id": _id,
    language,
    "slug": slug.current,
    primaryDomain,
    translationGroupId,
    riskLevel,
    "medicalOwner": medicalOwner._ref,
    lastMedicalReview,
    reviewIntervalMonths,
    "sources": sources[]._ref,
    "translatedFrom": translatedFrom._ref,
    sourceMedicalRevision,
    withdrawn,
    "replacement": replacement._ref
  }`),
  client.fetch(
    '*[_type in ["article", "clinicalCase"]]{_id,medicalOwner,"sources":sources[]._ref}',
  ),
]);

if (siteSettings?.title !== 'POLINA VET' || siteSettings.defaultLanguage !== 'ru')
  throw new Error('siteSettings singleton is missing or does not contain the safe seed values.');
const seededEditorialPolicy = editorialPolicy.find(
  (page) =>
    page._id === 'page-editorial-policy-ru' &&
    page.language === 'ru' &&
    page.translationGroupId === 'editorial-policy' &&
    page.slug === 'editorial-policy',
);
if (!seededEditorialPolicy)
  throw new Error(
    'The safe editorial-policy page is missing or has an invalid localization contract.',
  );

const policyErrors = validateContent(articles);
if (policyErrors.length) throw new Error(policyErrors.join('\n'));
if (
  documents.some(
    (document) =>
      document.medicalOwner?._ref === 'author-pending' ||
      document.sources?.includes('source-pending'),
  )
)
  throw new Error('A medical placeholder must never be published to the public dataset.');

console.log('Remote Sanity verification passed.');
