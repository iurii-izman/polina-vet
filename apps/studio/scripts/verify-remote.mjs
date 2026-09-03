import { createClient } from '@sanity/client';
import { getCliClient } from 'sanity/cli';

import {
  validateContent,
  validateRoutableContentIdentity,
} from '../../../scripts/validate-content.mjs';
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
const authenticatedClient = getCliClient({ apiVersion: SANITY_API_VERSION });

const [siteSettings, publicPages, publicArticles, documents, routableDocuments] = await Promise.all(
  [
    client.fetch('*[_type == "siteSettings" && _id == "siteSettings"]{_id,title,defaultLanguage}'),
    client.fetch('*[_type == "page"]{"id":_id,language,translationGroupId,"slug":slug.current}'),
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
      '*[_type in ["article", "clinicalCase"]]{_id,_type,medicalOwner,"sources":sources[]._ref}',
    ),
    authenticatedClient.fetch(`
    *[
      _type in ["page", "article"] &&
      !(_id in path("drafts.**"))
    ]{
      "id": _id,
      _type,
      language,
      translationGroupId,
      "slug": slug.current,
      primaryDomain,
      riskLevel,
      "medicalOwner": medicalOwner._ref,
      lastMedicalReview,
      reviewIntervalMonths,
      "sources": sources[]._ref,
      "translatedFrom": translatedFrom._ref,
      sourceMedicalRevision,
      withdrawn,
      "replacement": replacement._ref
    }
  `),
  ],
);

if (siteSettings.length !== 1)
  throw new Error(
    `siteSettings singleton expected exactly one document, found ${siteSettings.length}.`,
  );
if (siteSettings[0].title !== 'POLINA VET' || siteSettings[0].defaultLanguage !== 'ru')
  throw new Error('siteSettings singleton is missing or does not contain the safe seed values.');
const seededEditorialPolicies = routableDocuments.filter(
  (page) =>
    page._type === 'page' &&
    page.language === 'ru' &&
    page.translationGroupId === 'editorial-policy' &&
    page.slug === 'editorial-policy',
);
if (seededEditorialPolicies.length !== 1)
  throw new Error(
    `The safe editorial-policy page must have exactly one logical identity, found ${seededEditorialPolicies.length}.`,
  );

const pages = routableDocuments.filter((document) => document._type === 'page');
const articles = routableDocuments.filter((document) => document._type === 'article');
const inaccessibleDocuments = routableDocuments.filter(
  (document) =>
    ![...publicPages, ...publicArticles].some(
      (publicDocument) => publicDocument.id === document.id,
    ),
);
if (inaccessibleDocuments.length)
  throw new Error(
    `Routable published content must be available through the unauthenticated published API: ${inaccessibleDocuments.map((document) => document.id).join(', ')}.`,
  );

const policyErrors = validateContent(articles);
if (policyErrors.length) throw new Error(policyErrors.join('\n'));
const identityErrors = validateRoutableContentIdentity({ pages, articles });
if (identityErrors.length) throw new Error(identityErrors.join('\n'));
if (
  documents.some(
    (document) =>
      document.medicalOwner?._ref === 'author-pending' ||
      document.sources?.includes('source-pending'),
  )
)
  throw new Error('A medical placeholder must never be published to the public dataset.');

console.log(
  `Remote Sanity verification passed. pages=${pages.length}; articles=${articles.length}; clinicalCases=${documents.filter((document) => document._type === 'clinicalCase').length}.`,
);
