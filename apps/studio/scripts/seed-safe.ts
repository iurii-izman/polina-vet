import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../../../sanity.shared';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });
const canonicalEditorialPolicyId = 'page-editorial-policy-ru';
const legacyEditorialPolicyId = 'page.editorial-policy.ru';

const block = (key: string, text: string, style: 'normal' | 'h2' = 'normal') => ({
  _key: key,
  _type: 'block',
  children: [{ _key: `${key}-text`, _type: 'span', marks: [], text }],
  markDefs: [],
  style,
});

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  title: 'POLINA VET',
  defaultLanguage: 'ru',
};

const editorialPolicy = {
  _type: 'page',
  title: 'Как готовятся материалы POLINA VET',
  slug: { _type: 'slug', current: 'editorial-policy' },
  language: 'ru',
  translationGroupId: 'editorial-policy',
  body: [
    block('owner-heading', 'Кто отвечает за контент', 'h2'),
    block(
      'owner-copy',
      'Медицинский владелец, уровень риска, дата последнего медицинского пересмотра, источники и отдельная medicalRevision.',
    ),
    block('sources-heading', 'Какие источники используются', 'h2'),
    block(
      'sources-copy',
      'Медицинские материалы содержат источники и дату последнего медицинского пересмотра.',
    ),
    block('review-heading', 'Как проходит медицинский пересмотр', 'h2'),
    block('review-copy', 'Независимый reviewer — по риску, а не формально.'),
    block('translation-heading', 'Как обновляются переводы', 'h2'),
    block(
      'translation-copy',
      'Перевод связан с medicalRevision исходного документа; медицинское изменение может перевести его в состояние «Перевод требует обновления».',
    ),
    block('limits-heading', 'Что сайт может и чего не может заменить', 'h2'),
    block(
      'limits-copy',
      'Материалы POLINA VET носят информационный характер. Они помогают лучше ориентироваться в ситуации, но не заменяют индивидуальную клиническую оценку животного.',
    ),
  ],
};
await client.createOrReplace(siteSettings);

const matchingEditorialPolicies = await client.fetch<Array<{ _id: string }>>(
  `*[
    _type == "page" &&
    language == "ru" &&
    translationGroupId == "editorial-policy" &&
    slug.current == "editorial-policy"
  ]{_id}`,
);

if (matchingEditorialPolicies.length > 1)
  throw new Error(
    'Safe seed refused: Editorial Policy has multiple documents with the same logical identity.',
  );

const existingEditorialPolicyId = matchingEditorialPolicies[0]?._id;
if (existingEditorialPolicyId === legacyEditorialPolicyId) {
  await client.createOrReplace({ ...editorialPolicy, _id: canonicalEditorialPolicyId });
  console.log(
    `Safe seed created canonical ${canonicalEditorialPolicyId}; delete legacy ${legacyEditorialPolicyId} after public verification.`,
  );
} else {
  const editorialPolicyId = existingEditorialPolicyId ?? canonicalEditorialPolicyId;
  await client.createOrReplace({ ...editorialPolicy, _id: editorialPolicyId });
  console.log(`Safe seed completed: siteSettings and ${editorialPolicyId}.`);
}
