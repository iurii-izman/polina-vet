import { createClient } from '@sanity/client';
import { getCliClient } from 'sanity/cli';

import {
  collectEditorialWarnings,
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

const [
  siteSettings,
  publicPages,
  publicArticles,
  publicAuthors,
  sources,
  species,
  topics,
  documents,
  routableDocuments,
] = await Promise.all([
  client.fetch(
    '*[_type == "siteSettings"]{_id,title,defaultLanguage,primaryAuthor,contacts,location,serviceModes,featuredKnowledge}',
  ),
  client.fetch('*[_type == "page"]{"id":_id,language,translationGroupId,"slug":slug.current}'),
  client.fetch(`*[_type == "article"]{
    "id": _id,
    title, summary,
    language,
    "slug": slug.current,
    primaryDomain,
    translationGroupId,
    riskLevel,
    "medicalOwner": medicalOwner._ref,
    "reviewedBy": reviewedBy._ref,
    lastMedicalReview,
    reviewIntervalMonths,
    medicalRevision,
    body,
    "sources": sources[]._ref,
    "translatedFrom": translatedFrom._ref,
    sourceMedicalRevision,
    previousSlugs,
    archived,
    withdrawn,
    "replacement": replacement._ref
  }`),
  client.fetch('*[_type == "author"]{"id":_id,name,role,"slug":slug.current}'),
  client.fetch(
    '*[_type == "source"]{"id":_id,title,url,status,identifier,"supersededBy":supersededBy._ref}',
  ),
  client.fetch('*[_type == "species"]{"id":_id,name,labels}'),
  client.fetch('*[_type == "topic"]{"id":_id,name,labels}'),
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
      title,
      summary,
      primaryDomain,
      riskLevel,
      "medicalOwner": medicalOwner._ref,
      "reviewedBy": reviewedBy._ref,
      lastMedicalReview,
      reviewIntervalMonths,
      medicalRevision,
      body,
      "sources": sources[]._ref,
      "translatedFrom": translatedFrom._ref,
      sourceMedicalRevision,
      previousSlugs,
      archived,
      withdrawn,
      "replacement": replacement._ref
    }
  `),
]);

if (siteSettings.length !== 1)
  throw new Error(
    `siteSettings singleton expected exactly one document, found ${siteSettings.length}.`,
  );
if (
  siteSettings[0]._id !== 'siteSettings' ||
  siteSettings[0].title !== 'POLINA VET' ||
  siteSettings[0].defaultLanguage !== 'ru'
)
  throw new Error('siteSettings singleton is missing or does not contain the safe seed values.');
const primaryAuthorId = siteSettings[0].primaryAuthor?._ref;
const publicAuthorIds = new Set(publicAuthors.map((author) => author.id));
if (!primaryAuthorId || !publicAuthorIds.has(primaryAuthorId))
  throw new Error('siteSettings.primaryAuthor does not resolve through the public API.');
if (siteSettings[0].contacts?.primaryPhone !== '+373 777 40970')
  throw new Error('siteSettings.contacts.primaryPhone is missing or invalid.');
if (siteSettings[0].contacts?.telegramHandle !== '@Polly_My')
  throw new Error('siteSettings.contacts.telegramHandle is missing or invalid.');
if (siteSettings[0].location?.label !== 'Ветеринарный участок, с. Кицканы')
  throw new Error('siteSettings.location.label is missing or invalid.');
if (!siteSettings[0].location?.mapUrl?.startsWith('https://'))
  throw new Error('siteSettings.location.mapUrl must be an HTTPS URL.');
const allowedServiceModes = new Set(['personalInquiry', 'appointment', 'fieldVisit']);
if (
  !siteSettings[0].serviceModes?.length ||
  siteSettings[0].serviceModes.some((mode) => !allowedServiceModes.has(mode))
)
  throw new Error('siteSettings.serviceModes contains an invalid or missing value.');
const seededEditorialPolicies = routableDocuments.filter(
  (page) =>
    page._type === 'page' &&
    page.translationGroupId === 'editorial-policy' &&
    page.slug === 'editorial-policy',
);
const editorialPolicyLanguages = seededEditorialPolicies.map((page) => page.language).sort();
if (seededEditorialPolicies.length !== 3 || editorialPolicyLanguages.join(',') !== 'ro,ru,uk')
  throw new Error(
    `M6 Editorial Policy baseline must have exactly one published page for ru, ro, and uk; found ${editorialPolicyLanguages.join(',') || 'none'}.`,
  );

const expectedSpecies = new Set(['Собака', 'Кошка']);
const expectedTopics = new Set([
  'Желудочно-кишечные симптомы',
  'Вакцинация',
  'Паразиты',
  'Наблюдение',
  'Профилактика',
  'Хозяйство',
  'Клинические разборы',
]);
for (const [kind, records, expectedNames] of [
  ['species', species, expectedSpecies],
  ['topic', topics, expectedTopics],
]) {
  const names = new Set(records.map((record) => record.name));
  for (const name of expectedNames)
    if (!names.has(name)) throw new Error(`M6 ${kind} baseline is missing ${name}.`);
  for (const record of records) {
    if (
      !record.labels ||
      typeof record.labels.ru !== 'string' ||
      typeof record.labels.ro !== 'string' ||
      typeof record.labels.uk !== 'string'
    )
      throw new Error(`M6 ${kind} ${record.id} must have ru, ro, and uk labels.`);
  }
}

const pages = routableDocuments.filter((document) => document._type === 'page');
const articles = routableDocuments.filter((document) => document._type === 'article');
const nonRussianArticles = articles.filter((article) => article.language !== 'ru');
if (nonRussianArticles.length)
  throw new Error(
    `M6 baseline must not publish non-RU medical Articles; found ${nonRussianArticles.map((article) => article.id).join(', ')}.`,
  );
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

const policyErrors = validateContent(articles, sources);
if (policyErrors.length) throw new Error(policyErrors.join('\n'));
const publicSourceIds = new Set(sources.map((source) => source.id));
if (sources.length !== 8) throw new Error(`Expected 8 sources, found ${sources.length}.`);
const sourceUrls = sources.map((source) => source.url).filter(Boolean);
if (new Set(sourceUrls).size !== sourceUrls.length)
  throw new Error('Duplicate source URLs found in the public dataset.');
const woahSource = sources.find((source) => source.id === 'source-woah-terrestrial-code-2024');
if (
  woahSource?.title !== 'WOAH: Terrestrial Animal Health Code — current online edition' ||
  woahSource?.url !== 'https://sont.woah.org/portal/tool?le=en' ||
  woahSource?.status !== 'current' ||
  woahSource.identifier
)
  throw new Error('The WOAH source does not contain the current online-edition metadata.');
const vomitingSource = sources.find((source) => source.id === 'source-msd-vomiting');
if (vomitingSource?.identifier)
  throw new Error('The MSD Vomiting source must not use an update date as identifier.');
for (const article of articles) {
  if (!article.medicalOwner || !publicAuthorIds.has(article.medicalOwner))
    throw new Error(`${article.id}: medicalOwner does not resolve through the public API.`);
  if (
    article.riskLevel === 'HIGH' &&
    (!article.reviewedBy || !publicAuthorIds.has(article.reviewedBy))
  )
    throw new Error(`${article.id}: HIGH-risk reviewedBy does not resolve through the public API.`);
  if (article.riskLevel === 'HIGH' && article.reviewedBy === article.medicalOwner)
    throw new Error(`${article.id}: HIGH-risk reviewedBy must be independent from medicalOwner.`);
  for (const sourceId of article.sources ?? [])
    if (!publicSourceIds.has(sourceId))
      throw new Error(`${article.id}: source ${sourceId} does not resolve through the public API.`);
}
const publicArticleIds = new Set(publicArticles.map((article) => article.id));
for (const featured of siteSettings[0].featuredKnowledge ?? [])
  if (!publicArticleIds.has(featured._ref))
    throw new Error(
      `siteSettings.featuredKnowledge reference ${featured._ref} does not resolve publicly.`,
    );
const editorialWarnings = collectEditorialWarnings(articles, sources);
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
  `Remote Sanity verification passed. pages=${pages.length}; articles=${articles.length}; authors=${publicAuthors.length}; sources=${sources.length}; clinicalCases=${documents.filter((document) => document._type === 'clinicalCase').length}; species=${species.length}; topics=${topics.length}; editorialPolicyLanguages=${editorialPolicyLanguages.join(',')}; publishedNonRuMedicalArticles=${nonRussianArticles.length}; editorialWarnings=${editorialWarnings.length}.`,
);
