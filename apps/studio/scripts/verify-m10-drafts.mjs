import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../../../sanity.shared';

const client = getCliClient({ apiVersion: SANITY_API_VERSION }).withConfig({
  perspective: 'raw',
  useCdn: false,
});
const allArticles = await client.fetch(`
  *[_type == "article"]{
    _id, _type, title, summary, language, translationGroupId, primaryDomain,
    "slug": slug.current, translatedFrom, sourceMedicalRevision, medicalOwner,
    reviewedBy, riskLevel, medicalRevision, lastMedicalReview, reviewIntervalMonths,
    sources, body, archived, withdrawn
  }
`);
const drafts = allArticles.filter(
  (document) =>
    document._id.startsWith('drafts.') && document.translationGroupId?.startsWith('m10-'),
);
const errors = [];
const sourceDrafts = drafts.filter((document) => document.language === 'ru');
const translations = drafts.filter(
  (document) => document.language === 'ro' || document.language === 'uk',
);
const ids = new Set(drafts.map((document) => document._id));
const groups = new Map();
for (const document of drafts) {
  if (document._type !== 'article') errors.push(`${document._id}: unexpected draft type`);
  if (!document.title || !document.summary || !document.slug || !document.body?.length)
    errors.push(`${document._id}: incomplete editorial draft`);
  if (document.archived || document.withdrawn)
    errors.push(`${document._id}: M10 draft must be active`);
  if (!document.sources?.length) errors.push(`${document._id}: missing sources`);
  if (/\[PREVIEW QA\]|QA DRAFT|placeholder/i.test(`${document.title} ${document.summary}`))
    errors.push(`${document._id}: QA marker leaked into editorial draft`);
  const group = `${document.translationGroupId}:${document.language}`;
  if (groups.has(group)) errors.push(`${document._id}: duplicate translation identity ${group}`);
  groups.set(group, document._id);
  if (document.language === 'ru') {
    if (document.translatedFrom || document.sourceMedicalRevision != null)
      errors.push(`${document._id}: RU source contains translation lineage`);
    if (document.riskLevel === 'HIGH' && document.reviewedBy)
      errors.push(`${document._id}: HIGH draft must not invent reviewedBy`);
  } else {
    if (!document.translatedFrom?._ref || !ids.has(document.translatedFrom._ref))
      errors.push(`${document._id}: translatedFrom does not point to an M10 RU draft`);
    const source = drafts.find((candidate) => candidate._id === document.translatedFrom?._ref);
    if (source?.language !== 'ru' || source?.translationGroupId !== document.translationGroupId)
      errors.push(`${document._id}: translation family/source mismatch`);
    if (document.sourceMedicalRevision != null)
      errors.push(`${document._id}: translation is CURRENT before human review`);
  }
}
for (const source of sourceDrafts) {
  for (const language of ['ro', 'uk']) {
    const hasTranslation = drafts.some(
      (document) =>
        document.translationGroupId === source.translationGroupId && document.language === language,
    );
    if (!hasTranslation) errors.push(`${source._id}: missing ${language} translation draft`);
  }
}
if (sourceDrafts.length !== 14)
  errors.push(`Expected 14 RU M10 drafts, found ${sourceDrafts.length}.`);
if (translations.length !== 28)
  errors.push(`Expected 28 RO/UK M10 drafts, found ${translations.length}.`);
if (drafts.length !== 42)
  errors.push(`Expected 42 intentional M10 editorial drafts, found ${drafts.length}.`);
const high = sourceDrafts.filter((document) => document.riskLevel === 'HIGH');
const standard = sourceDrafts.filter((document) => document.riskLevel === 'STANDARD');
if (high.length !== 7 || standard.length !== 7)
  errors.push(
    `Expected HIGH=7 and STANDARD=7, found HIGH=${high.length}, STANDARD=${standard.length}.`,
  );
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `M10 draft verification passed: total=${drafts.length}; RU=${sourceDrafts.length}; RO/UK=${translations.length}; HIGH=${high.length}; STANDARD=${standard.length}; translationState=REVIEW_REQUIRED; QA=0.`,
);
