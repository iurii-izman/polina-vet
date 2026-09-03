const languages = new Set(['ru', 'ro', 'uk']);
const domains = new Set(['pet', 'farm', 'shared']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateContent(documents, sources = []) {
  const errors = [];
  const ids = new Map(documents.map((document) => [document.id, document]));
  const sourceIds = new Map(sources.map((source) => [source.id, source]));
  const routes = new Map();
  for (const document of documents) {
    if (!languages.has(document.language)) errors.push(`${document.id}: unsupported language`);
    if (!domains.has(document.primaryDomain)) errors.push(`${document.id}: invalid primaryDomain`);
    if (!document.slug || !slugPattern.test(document.slug))
      errors.push(`${document.id}: invalid slug`);
    if (
      !document.title ||
      !document.summary ||
      !document.translationGroupId ||
      !document.medicalOwner ||
      !document.riskLevel ||
      document.medicalRevision < 1 ||
      !document.lastMedicalReview ||
      document.reviewIntervalMonths < 1 ||
      !document.sources?.length ||
      !document.body?.length
    )
      errors.push(`${document.id}: required publication contract is incomplete`);
    const section =
      document.primaryDomain === 'pet'
        ? 'pets'
        : document.primaryDomain === 'farm'
          ? 'farm'
          : 'knowledge';
    const route = `/${document.language}/${section}/${document.slug}/`;
    if (routes.has(route))
      errors.push(`${document.id}: colliding localized route ${route} (also ${routes.get(route)})`);
    routes.set(route, document.id);
    if (document.riskLevel === 'HIGH' && !document.reviewedBy)
      errors.push(`${document.id}: HIGH-risk reviewer is required`);
    if (
      document.language !== 'ru' &&
      (!document.translatedFrom || document.sourceMedicalRevision < 1)
    )
      errors.push(`${document.id}: translation lineage is incomplete`);
    if (document.language === 'ru' && (document.translatedFrom || document.sourceMedicalRevision))
      errors.push(`${document.id}: RU source cannot have translation lineage`);
    if (document.withdrawn && (!document.replacement || document.replacement === document.id))
      errors.push(`${document.id}: withdrawn content needs a different safe replacement`);
    for (const sourceId of document.sources ?? []) {
      const source = sourceIds.get(sourceId);
      if (!source) errors.push(`${document.id}: unresolved source ${sourceId}`);
      if (source?.status === 'withdrawn')
        errors.push(`${document.id}: withdrawn source ${sourceId}`);
    }
  }
  for (const document of documents) {
    if (document.translatedFrom && !ids.has(document.translatedFrom))
      errors.push(`${document.id}: translation source does not exist`);
    if (
      document.translatedFrom &&
      ids.get(document.translatedFrom)?.translationGroupId !== document.translationGroupId
    )
      errors.push(`${document.id}: translation family does not match its source`);
    if (document.replacement && !ids.has(document.replacement))
      errors.push(`${document.id}: replacement does not exist`);
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
  !validateContent(
    [withdrawnSourceFixture],
    [{ id: 'synthetic-withdrawn', status: 'withdrawn' }],
  ).some((error) => error.includes('withdrawn source'))
)
  throw new Error('Withdrawn-source fixture did not fail policy validation.');
console.log('Local synthetic content policy validation passed. Fixtures are not seeded.');
