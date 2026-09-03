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
const localizedEditorialPolicies = [
  {
    _id: 'page-editorial-policy-ro',
    _type: 'page',
    language: 'ro',
    translationGroupId: 'editorial-policy',
    title: 'Cum sunt pregătite materialele POLINA VET',
    slug: { _type: 'slug', current: 'editorial-policy' },
    body: [
      block('owner-heading-ro', 'Cine răspunde pentru conținut', 'h2'),
      block(
        'owner-copy-ro',
        'Materialele au un responsabil medical, un nivel de risc, o dată a ultimei verificări medicale, surse și o medicalRevision separată.',
      ),
      block('translation-heading-ro', 'Cum sunt actualizate traducerile', 'h2'),
      block(
        'translation-copy-ro',
        'Traducerea este legată de medicalRevision a documentului sursă; o schimbare medicală poate impune actualizarea traducerii.',
      ),
      block('limits-heading-ro', 'Ce poate și ce nu poate înlocui site-ul', 'h2'),
      block(
        'limits-copy-ro',
        'Materialele POLINA VET au caracter informativ și nu înlocuiesc evaluarea clinică individuală a animalului.',
      ),
    ],
  },
  {
    _id: 'page-editorial-policy-uk',
    _type: 'page',
    language: 'uk',
    translationGroupId: 'editorial-policy',
    title: 'Як готуються матеріали POLINA VET',
    slug: { _type: 'slug', current: 'editorial-policy' },
    body: [
      block('owner-heading-uk', 'Хто відповідає за вміст', 'h2'),
      block(
        'owner-copy-uk',
        'Матеріали мають медичного відповідального, рівень ризику, дату останньої медичної перевірки, джерела та окрему medicalRevision.',
      ),
      block('translation-heading-uk', 'Як оновлюються переклади', 'h2'),
      block(
        'translation-copy-uk',
        'Переклад пов’язаний із medicalRevision вихідного документа; медична зміна може вимагати оновлення перекладу.',
      ),
      block('limits-heading-uk', 'Що сайт може і чого не може замінити', 'h2'),
      block(
        'limits-copy-uk',
        'Матеріали POLINA VET мають інформаційний характер і не замінюють індивідуальну клінічну оцінку тварини.',
      ),
    ],
  },
];

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

for (const page of localizedEditorialPolicies) await client.createOrReplace(page);
console.log(
  'Safe seed also prepared RO and UK Editorial Policy pages in the same translation family.',
);
