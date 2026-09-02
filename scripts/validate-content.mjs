const languages = new Set(['ru', 'ro', 'uk']);

/** Validates the extracted public route/content manifest before static generation. */
export function validateContent(documents) {
  const errors = [];
  const ids = new Map(documents.map((document) => [document.id, document]));
  const routes = new Set();
  for (const document of documents) {
    if (!languages.has(document.language)) errors.push(`${document.id}: unsupported language`);
    const route = `/${document.language}/${document.primaryDomain === 'farm' ? 'farm/' : document.primaryDomain === 'pet' ? 'pets/' : ''}${document.slug}/`;
    if (routes.has(route)) errors.push(`${document.id}: colliding localized route ${route}`);
    routes.add(route);
    if (
      document.riskLevel === 'HIGH' &&
      (!document.medicalOwner ||
        !document.lastMedicalReview ||
        !document.reviewIntervalMonths ||
        !document.sources?.length)
    )
      errors.push(`${document.id}: HIGH-risk governance is incomplete`);
    if (document.language !== 'ru' && (!document.translatedFrom || !document.sourceMedicalRevision))
      errors.push(`${document.id}: translation lineage is incomplete`);
    if (document.language === 'ru' && document.translatedFrom)
      errors.push(`${document.id}: RU reference cannot have translatedFrom`);
    if (document.withdrawn && !document.replacement)
      errors.push(`${document.id}: withdrawn content needs a safe replacement`);
  }
  for (const document of documents) {
    if (document.translatedFrom && !ids.has(document.translatedFrom))
      errors.push(`${document.id}: translation source does not exist`);
    if (
      document.translatedFrom &&
      ids.get(document.translatedFrom)?.translationGroupId !== document.translationGroupId
    )
      errors.push(`${document.id}: translation family does not match its source`);
  }
  return errors;
}

const fixture = [
  {
    id: 'ru-example',
    language: 'ru',
    slug: 'example',
    primaryDomain: 'pet',
    translationGroupId: 'example',
    riskLevel: 'HIGH',
    medicalOwner: 'author-pending',
    lastMedicalReview: '2026-09-02',
    reviewIntervalMonths: 3,
    sources: ['source-pending'],
  },
  {
    id: 'ro-example',
    language: 'ro',
    slug: 'example',
    primaryDomain: 'pet',
    translationGroupId: 'example',
    riskLevel: 'HIGH',
    medicalOwner: 'author-pending',
    lastMedicalReview: '2026-09-02',
    reviewIntervalMonths: 3,
    sources: ['source-pending'],
    translatedFrom: 'ru-example',
    sourceMedicalRevision: 1,
  },
];
const errors = validateContent(fixture);
if (errors.length) throw new Error(errors.join('\n'));
console.log('Content policy validation passed.');
