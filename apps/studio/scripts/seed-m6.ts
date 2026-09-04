import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../../../sanity.shared';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });

type LocalizedLabels = { ru: string; ro: string; uk: string };

const block = (key: string, text: string, style: 'normal' | 'h2' = 'normal') => ({
  _key: key,
  _type: 'block',
  children: [{ _key: `${key}-text`, _type: 'span', marks: [], text }],
  markDefs: [],
  style,
});

const editorialPolicies = [
  {
    _id: 'page-editorial-policy-ro',
    _type: 'page',
    title: 'Cum sunt pregătite materialele POLINA VET',
    slug: { _type: 'slug', current: 'editorial-policy' },
    language: 'ro',
    translationGroupId: 'editorial-policy',
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
    title: 'Як готуються матеріали POLINA VET',
    slug: { _type: 'slug', current: 'editorial-policy' },
    language: 'uk',
    translationGroupId: 'editorial-policy',
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

const localizedTaxonomy: Array<{
  _id: string;
  _type: 'species' | 'topic';
  name: string;
  labels: LocalizedLabels;
}> = [
  {
    _id: 'species-dog',
    _type: 'species',
    name: 'Собака',
    labels: { ru: 'Собака', ro: 'Câine', uk: 'Собака' },
  },
  {
    _id: 'species-cat',
    _type: 'species',
    name: 'Кошка',
    labels: { ru: 'Кошка', ro: 'Pisică', uk: 'Кішка' },
  },
  {
    _id: 'topic-gi-symptoms',
    _type: 'topic',
    name: 'Желудочно-кишечные симптомы',
    labels: {
      ru: 'Желудочно-кишечные симптомы',
      ro: 'Simptome gastrointestinale',
      uk: 'Шлунково-кишкові симптоми',
    },
  },
  {
    _id: 'topic-vaccination',
    _type: 'topic',
    name: 'Вакцинация',
    labels: { ru: 'Вакцинация', ro: 'Vaccinare', uk: 'Вакцинація' },
  },
  {
    _id: 'topic-parasites',
    _type: 'topic',
    name: 'Паразиты',
    labels: { ru: 'Паразиты', ro: 'Paraziți', uk: 'Паразити' },
  },
  {
    _id: 'topic-observation',
    _type: 'topic',
    name: 'Наблюдение',
    labels: { ru: 'Наблюдение', ro: 'Observație', uk: 'Спостереження' },
  },
  {
    _id: 'topic-prevention',
    _type: 'topic',
    name: 'Профилактика',
    labels: { ru: 'Профилактика', ro: 'Prevenție', uk: 'Профілактика' },
  },
  {
    _id: 'topic-farm',
    _type: 'topic',
    name: 'Хозяйство',
    labels: { ru: 'Хозяйство', ro: 'Gospodărie', uk: 'Господарство' },
  },
  {
    _id: 'topic-clinical-analysis',
    _type: 'topic',
    name: 'Клинические разборы',
    labels: { ru: 'Клинические разборы', ro: 'Analize clinice', uk: 'Клінічні розбори' },
  },
];

async function uniqueIdentity(query: string, params: Record<string, unknown>, label: string) {
  const matches = await client.fetch<Array<{ _id: string }>>(query, params);
  if (matches.length > 1) throw new Error(`M6 seed refused: duplicate ${label}.`);
  return matches[0]?._id;
}

async function assertStableId(document: { _id: string; _type: string }) {
  const existing = await client.fetch<{ _id: string; _type: string } | null>(
    '*[_id == $id][0]{_id,_type}',
    { id: document._id },
  );
  if (existing && existing._type !== document._type)
    throw new Error(
      `M6 seed refused: stable id ${document._id} is already used by ${existing._type}.`,
    );
}

async function patchTaxonomy(document: (typeof localizedTaxonomy)[number], existingId: string) {
  await client
    .patch(existingId)
    .set({
      'labels.ru': document.labels.ru,
      'labels.ro': document.labels.ro,
      'labels.uk': document.labels.uk,
    })
    .commit();
}

const policyIds = new Map<string, string | undefined>();
for (const language of ['ru', 'ro', 'uk']) {
  const id = await uniqueIdentity(
    '*[_type == "page" && language == $language && translationGroupId == "editorial-policy" && slug.current == "editorial-policy"]{_id}',
    { language },
    `Editorial Policy ${language} identity`,
  );
  if (language === 'ru' && !id)
    throw new Error('M6 seed refused: the existing RU Editorial Policy baseline is missing.');
  policyIds.set(language, id);
}

for (const policy of editorialPolicies) await assertStableId(policy);

const taxonomyIds = new Map<string, string>();
for (const document of localizedTaxonomy) {
  const id = await uniqueIdentity(
    `*[_type == $type && name == $name]{_id}`,
    { type: document._type, name: document.name },
    `${document._type} ${document.name} identity`,
  );
  if (!id)
    throw new Error(
      `M6 seed refused: existing M5 ${document._type} ${document.name} baseline is missing.`,
    );
  taxonomyIds.set(document._id, id);
}

for (const policy of editorialPolicies) {
  const existingId = policyIds.get(policy.language);
  if (existingId) {
    const { _id: _ignoredId, _type: _ignoredType, ...fields } = policy;
    await client.patch(existingId).set(fields).commit();
  } else {
    await client.createOrReplace(policy);
  }
}

for (const document of localizedTaxonomy)
  await patchTaxonomy(document, taxonomyIds.get(document._id) as string);

console.log(
  `M6 seed completed: Editorial Policy languages=ru,ro,uk; localized taxonomy=${localizedTaxonomy.length}; medical article translations published=0.`,
);
