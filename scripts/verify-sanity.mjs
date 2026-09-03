const projectId = process.env.SANITY_PROJECT_ID ?? '56xqpcyi';
const dataset = process.env.SANITY_DATASET ?? 'production';
const endpoint = `https://${projectId}.api.sanity.io/v2026-01-01/data/query/${dataset}`;

async function sanityFetch(query) {
  const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Sanity read-only verification failed: ${response.status}`);
  return (await response.json()).result;
}

const baseline = await sanityFetch(
  '{ "siteSettings": count(*[_type == "siteSettings"]), "editorialPolicy": count(*[_type == "page" && slug.current == "editorial-policy"]), "articles": count(*[_type == "article"]), "clinicalCases": count(*[_type == "clinicalCase"]) }',
);
if (
  baseline.siteSettings !== 1 ||
  baseline.editorialPolicy !== 1 ||
  baseline.articles !== 0 ||
  baseline.clinicalCases !== 0
)
  throw new Error(`Unexpected production baseline: ${JSON.stringify(baseline)}`);

const articles = await sanityFetch(
  `*[_type == "article"]{ _id, language, slug, primaryDomain, translationGroupId, translatedFrom->{ _id, translationGroupId, medicalRevision }, sourceMedicalRevision, medicalRevision, medicalOwner->{ _id }, reviewedBy->{ _id }, riskLevel, lastMedicalReview, reviewIntervalMonths, sources[]->{ _id, status }, body, withdrawn, replacement->{ _id } }`,
);
const ids = new Set(articles.map((article) => article._id));
const errors = [];
for (const article of articles) {
  if (!article.medicalOwner?._id) errors.push(`${article._id}: unresolved medicalOwner`);
  if (!article.sources?.length || article.sources.some((source) => !source?._id))
    errors.push(`${article._id}: unresolved source reference`);
  if (article.sources?.some((source) => source.status === 'withdrawn'))
    errors.push(`${article._id}: withdrawn source`);
  if (article.riskLevel === 'HIGH' && !article.reviewedBy?._id)
    errors.push(`${article._id}: HIGH reviewer missing`);
  if (article.language === 'ru' && (article.translatedFrom || article.sourceMedicalRevision))
    errors.push(`${article._id}: invalid RU lineage`);
  if (
    article.language !== 'ru' &&
    (!article.translatedFrom?._id ||
      article.translatedFrom.translationGroupId !== article.translationGroupId ||
      article.sourceMedicalRevision < 1)
  )
    errors.push(`${article._id}: invalid translation lineage`);
  if (article.withdrawn && (!article.replacement?._id || !ids.has(article.replacement._id)))
    errors.push(`${article._id}: invalid withdrawn replacement`);
  if (
    [article._id, article.slug?.current, article.medicalOwner?._id].some((value) =>
      /pending|placeholder|synthetic|patient|client/i.test(value ?? ''),
    )
  )
    errors.push(`${article._id}: placeholder/private fixture reference`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `Sanity production baseline and ${articles.length} published article(s) verified: ${JSON.stringify(baseline)}`,
);
