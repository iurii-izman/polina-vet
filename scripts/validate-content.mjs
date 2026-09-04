import { RESERVED_ARTICLE_ROUTES, reservedArticleRouteKey } from './reserved-routes.mjs';

const languages = new Set(['ru', 'ro', 'uk']);
const domains = new Set(['pet', 'farm', 'shared']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const referenceId = (reference) =>
  typeof reference === 'string' ? reference : (reference?.id ?? reference?._ref ?? reference?._id);

const sections = { pet: 'pets', farm: 'farm', shared: 'knowledge' };
const sectionForDomain = (domain) => sections[domain] ?? 'knowledge';
const sourceStatuses = new Set(['current', 'superseded', 'withdrawn']);
const isPositiveInteger = (value) => Number.isInteger(value) && value >= 1;

function validateDocumentFacts(document, sourceIds) {
  const errors = [];
  const incomplete =
    !document.title ||
    !document.summary ||
    !document.translationGroupId ||
    !document.medicalOwner ||
    !document.riskLevel ||
    !isPositiveInteger(document.medicalRevision) ||
    !document.lastMedicalReview ||
    !isPositiveInteger(document.reviewIntervalMonths) ||
    !document.sources?.length ||
    !document.body?.length;
  if (!languages.has(document.language)) errors.push(`${document.id}: unsupported language`);
  if (!domains.has(document.primaryDomain)) errors.push(`${document.id}: invalid primaryDomain`);
  if (!document.slug || !slugPattern.test(document.slug))
    errors.push(`${document.id}: invalid slug`);
  if (incomplete) errors.push(`${document.id}: required publication contract is incomplete`);
  if (document.riskLevel === 'HIGH' && !document.reviewedBy)
    errors.push(`${document.id}: HIGH-risk reviewer is required`);
  if (
    document.riskLevel === 'HIGH' &&
    document.medicalOwner &&
    document.reviewedBy &&
    referenceId(document.medicalOwner) === referenceId(document.reviewedBy)
  )
    errors.push(`${document.id}: HIGH-risk reviewer must be independent from medicalOwner`);
  if (
    document.language !== 'ru' &&
    (!document.translatedFrom || !isPositiveInteger(document.sourceMedicalRevision))
  )
    errors.push(`${document.id}: translation lineage is incomplete`);
  if (
    document.language === 'ru' &&
    ((document.translatedFrom !== undefined && document.translatedFrom !== null) ||
      (document.sourceMedicalRevision !== undefined && document.sourceMedicalRevision !== null))
  )
    errors.push(`${document.id}: RU source cannot have translation lineage`);
  if (
    document.withdrawn &&
    (!document.replacement || referenceId(document.replacement) === document.id)
  )
    errors.push(`${document.id}: withdrawn content needs a different safe replacement`);
  if (RESERVED_ARTICLE_ROUTES.has(reservedArticleRouteKey(document)))
    errors.push(`${document.id}: article route collides with a reserved static route`);
  for (const sourceReference of document.sources ?? []) {
    const sourceId = referenceId(sourceReference);
    const source = sourceIds.get(sourceId);
    if (!source) {
      errors.push(`${document.id}: unresolved source ${sourceId}`);
    } else {
      if (!sourceStatuses.has(source.status))
        errors.push(`${document.id}: source ${sourceId} has invalid status`);
      if (
        source.status === 'superseded' &&
        (!source.supersededBy ||
          referenceId(source.supersededBy) === sourceId ||
          !sourceIds.has(referenceId(source.supersededBy)))
      )
        errors.push(`${document.id}: superseded source ${sourceId} needs a different supersededBy`);
    }
  }
  return errors;
}

export function validateContent(documents, sources = []) {
  const errors = [];
  const ids = new Map(documents.map((document) => [document.id, document]));
  const sourceIds = new Map(sources.map((source) => [source.id, source]));
  const routes = new Map();
  for (const document of documents) {
    errors.push(...validateDocumentFacts(document, sourceIds));
    const section = sectionForDomain(document.primaryDomain);
    const route = `/${document.language}/${section}/${document.slug}/`;
    if (routes.has(route))
      errors.push(`${document.id}: colliding localized route ${route} (also ${routes.get(route)})`);
    routes.set(route, document.id);
  }
  for (const document of documents) {
    if (document.translatedFrom && !ids.has(referenceId(document.translatedFrom)))
      errors.push(`${document.id}: translation source does not exist`);
    if (
      document.translatedFrom &&
      ids.get(referenceId(document.translatedFrom))?.translationGroupId !==
        document.translationGroupId
    )
      errors.push(`${document.id}: translation family does not match its source`);
    const translationSource = document.translatedFrom
      ? ids.get(referenceId(document.translatedFrom))
      : undefined;
    if (document.translatedFrom && translationSource) {
      if (translationSource.language !== 'ru')
        errors.push(`${document.id}: translation source must be the RU source`);
      if (translationSource.primaryDomain !== document.primaryDomain)
        errors.push(`${document.id}: translation domain does not match its source`);
      if (document.sourceMedicalRevision !== translationSource.medicalRevision)
        errors.push(
          `${document.id}: sourceMedicalRevision does not match the current source revision`,
        );
    }
    const replacementId = referenceId(document.replacement);
    const replacement = replacementId ? ids.get(replacementId) : undefined;
    if (replacementId && !replacement) errors.push(`${document.id}: replacement does not exist`);
    if (replacementId && replacement && (replacement.withdrawn || replacement.archived))
      errors.push(`${document.id}: replacement must be active and routable`);
    if (
      replacementId &&
      replacement &&
      (!replacement.slug ||
        !languages.has(replacement.language) ||
        !domains.has(replacement.primaryDomain))
    )
      errors.push(`${document.id}: replacement is not routable`);
    if (replacementId && replacement && referenceId(replacement.replacement) === document.id)
      errors.push(`${document.id}: replacement creates an obvious two-document cycle`);
    if (document.previousSlugs?.includes(document.slug))
      errors.push(`${document.id}: current slug is duplicated in previousSlugs`);
  }
  return errors;
}

/** Validates one published document per routable identity and translation locale. */
export function validateRoutableContentIdentity({ pages, articles }) {
  const errors = [];
  const validateDocuments = (type, documents, routeIdentity) => {
    const routes = new Map();
    const translations = new Map();

    for (const document of documents) {
      const route = routeIdentity(document);
      if (routes.has(route))
        errors.push(
          `${document.id}: duplicate ${type} route identity ${route} (also ${routes.get(route)})`,
        );
      else routes.set(route, document.id);

      const translation = `${document.translationGroupId}:${document.language}`;
      if (translations.has(translation))
        errors.push(
          `${document.id}: duplicate ${type} translation identity ${translation} (also ${translations.get(translation)})`,
        );
      else translations.set(translation, document.id);
    }
  };

  validateDocuments('page', pages, (page) => `${page.language}:${page.slug}`);
  validateDocuments(
    'article',
    articles,
    (article) => `${article.language}:${article.primaryDomain}:${article.slug}`,
  );
  return errors;
}

export function collectEditorialWarnings(documents, sources = []) {
  const sourceIds = new Map(sources.map((source) => [source.id, source]));
  return documents.flatMap((document) =>
    (document.sources ?? [])
      .filter(
        (sourceId) =>
          sourceIds.get(referenceId(sourceId))?.status === 'withdrawn' ||
          sourceIds.get(referenceId(sourceId))?.status === 'superseded',
      )
      .map(
        (sourceId) =>
          `${document.id}: source ${referenceId(sourceId)} is ${sourceIds.get(referenceId(sourceId)).status}`,
      ),
  );
}

const fixtures = [
  {
    id: 'ru-synthetic-standard',
    language: 'ru',
    slug: 'synthetic-standard',
    primaryDomain: 'pet',
    title: 'Synthetic test article',
    summary: 'Synthetic summary only.',
    translationGroupId: 'synthetic',
    medicalOwner: 'synthetic-author',
    riskLevel: 'STANDARD',
    medicalRevision: 1,
    lastMedicalReview: '2026-01-01',
    reviewIntervalMonths: 12,
    sources: ['synthetic-current'],
    body: ['Test action A'],
  },
  {
    id: 'ru-synthetic-high-stale',
    language: 'ru',
    slug: 'synthetic-high-stale',
    primaryDomain: 'farm',
    title: 'Synthetic stale high article',
    summary: 'Synthetic summary only.',
    translationGroupId: 'high-stale',
    medicalOwner: 'synthetic-author',
    reviewedBy: 'synthetic-reviewer',
    riskLevel: 'HIGH',
    medicalRevision: 1,
    lastMedicalReview: '2020-01-01',
    reviewIntervalMonths: 3,
    sources: ['synthetic-current'],
    body: ['Test action A'],
  },
  {
    id: 'ru-synthetic-withdrawn',
    language: 'ru',
    slug: 'synthetic-withdrawn',
    primaryDomain: 'pet',
    title: 'Synthetic withdrawn article',
    summary: 'Synthetic summary only.',
    translationGroupId: 'withdrawn',
    medicalOwner: 'synthetic-author',
    riskLevel: 'STANDARD',
    medicalRevision: 1,
    lastMedicalReview: '2026-01-01',
    reviewIntervalMonths: 12,
    sources: ['synthetic-current'],
    body: ['Test action A'],
    withdrawn: true,
    replacement: 'ru-synthetic-standard',
  },
  {
    id: 'ru-synthetic-translation-source',
    language: 'ru',
    slug: 'synthetic-translation-source',
    primaryDomain: 'pet',
    title: 'Synthetic translation source',
    summary: 'Synthetic summary only.',
    translationGroupId: 'translation',
    medicalOwner: 'synthetic-author',
    riskLevel: 'STANDARD',
    medicalRevision: 2,
    lastMedicalReview: '2026-01-01',
    reviewIntervalMonths: 12,
    sources: ['synthetic-current'],
    body: ['Test action A'],
  },
  {
    id: 'ro-synthetic-current',
    language: 'ro',
    slug: 'synthetic-current',
    primaryDomain: 'pet',
    title: 'Synthetic current translation',
    summary: 'Synthetic summary only.',
    translationGroupId: 'translation',
    medicalOwner: 'synthetic-author',
    riskLevel: 'STANDARD',
    medicalRevision: 1,
    sourceMedicalRevision: 2,
    translatedFrom: 'ru-synthetic-translation-source',
    lastMedicalReview: '2026-01-01',
    reviewIntervalMonths: 12,
    sources: ['synthetic-current'],
    body: ['Test action A'],
  },
];
const errors = validateContent(fixtures, [{ id: 'synthetic-current', status: 'current' }]);
if (errors.length) throw new Error(errors.join('\n'));
const withdrawnSourceFixture = {
  ...fixtures[0],
  id: 'ru-synthetic-withdrawn-source',
  sources: ['synthetic-withdrawn'],
};
if (
  validateContent([withdrawnSourceFixture], [{ id: 'synthetic-withdrawn', status: 'withdrawn' }])
    .length
)
  throw new Error('Withdrawn-source fixture must be a valid build input.');
if (
  !collectEditorialWarnings(
    [withdrawnSourceFixture],
    [{ id: 'synthetic-withdrawn', status: 'withdrawn' }],
  ).length
)
  throw new Error('Withdrawn-source fixture did not produce an editorial warning.');
console.log('Local synthetic content policy validation passed. Fixtures are not seeded.');
