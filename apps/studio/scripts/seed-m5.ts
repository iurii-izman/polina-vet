import { createReadStream, existsSync } from 'node:fs';
import { basename } from 'node:path';
import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../../../sanity.shared';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });
const reviewDate = '2026-09-03';
const portraitAlt = 'Изман Полина Андреевна, ветеринарный врач';

type Reference = { _type: 'reference'; _ref: string };

const ref = (_ref: string): Reference => ({ _type: 'reference', _ref });
const block = (key: string, text: string, style: 'normal' | 'h2' | 'h3' = 'normal') => ({
  _key: key,
  _type: 'block',
  children: [{ _key: `${key}-text`, _type: 'span', marks: [], text }],
  markDefs: [],
  style,
});
const listBlock = (
  _type: 'practicalActions' | 'dontDoBlock' | 'redFlagCategory' | 'checklist' | 'nextSteps',
  key: string,
  title: string,
  items: string[],
  description?: string,
) => ({ _key: key, _type, title, items, ...(description ? { description } : {}) });
const safety = (key: string, title: string, text: string) => ({
  _key: key,
  _type: 'safetyNotice',
  title,
  text,
});

async function logicalId(query: string, params: Record<string, unknown>, label: string) {
  const matches = await client.fetch<Array<{ _id: string }>>(query, params);
  if (matches.length > 1) throw new Error(`M5 seed refused: duplicate ${label}.`);
  return matches[0]?._id;
}

async function upsert(
  document: Record<string, unknown>,
  existingId?: string,
  unsetFields: string[] = [],
) {
  const { _id, _type, ...fields } = document;
  if (existingId) {
    const patch = client.patch(existingId).set(fields);
    return unsetFields.length ? patch.unset(unsetFields).commit() : patch.commit();
  }
  if (typeof _id !== 'string') throw new Error('M5 seed document is missing a stable _id.');
  if (typeof _type !== 'string') throw new Error(`M5 seed document ${_id} is missing _type.`);
  const createDocument: { _id: string; _type: string; [key: string]: any } = {
    ...fields,
    _id,
    _type,
  };
  return client.createOrReplace(createDocument);
}

const species = [
  {
    _id: 'species-dog',
    _type: 'species',
    name: 'Собака',
  },
  {
    _id: 'species-cat',
    _type: 'species',
    name: 'Кошка',
  },
];
const topics = [
  {
    _id: 'topic-gi-symptoms',
    _type: 'topic',
    name: 'Желудочно-кишечные симптомы',
  },
  {
    _id: 'topic-vaccination',
    _type: 'topic',
    name: 'Вакцинация',
  },
  {
    _id: 'topic-parasites',
    _type: 'topic',
    name: 'Паразиты',
  },
  {
    _id: 'topic-observation',
    _type: 'topic',
    name: 'Наблюдение',
  },
  {
    _id: 'topic-prevention',
    _type: 'topic',
    name: 'Профилактика',
  },
  {
    _id: 'topic-farm',
    _type: 'topic',
    name: 'Хозяйство',
  },
  {
    _id: 'topic-clinical-analysis',
    _type: 'topic',
    name: 'Клинические разборы',
  },
];

const sources = [
  {
    _id: 'source-wsava-vaccination-2024',
    _type: 'source',
    title: 'WSAVA: 2024 guidelines for the vaccination of dogs and cats',
    url: 'https://wsava.org/Global-Guidelines/Vaccination-Guidelines/',
    status: 'current',
    jurisdiction: 'Международный ветеринарный консенсус',
    identifier: '2024',
  },
  {
    _id: 'source-esccap-gl1',
    _type: 'source',
    title: 'ESCCAP GL1: Worm Control in Dogs and Cats',
    url: 'https://www.esccap.org/guidelines/gl1/',
    status: 'current',
    jurisdiction: 'Европейская экспертная группа ESCCAP',
  },
  {
    _id: 'source-esccap-gl3',
    _type: 'source',
    title: 'ESCCAP GL3: Control of Ectoparasites in Dogs and Cats',
    url: 'https://www.esccap.org/guidelines/gl3/',
    status: 'current',
    jurisdiction: 'Европейская экспертная группа ESCCAP',
  },
  {
    _id: 'source-msd-vomiting',
    _type: 'source',
    title: 'MSD Veterinary Manual: Vomiting in Dogs',
    url: 'https://www.msdvetmanual.com/dog-owners/digestive-disorders-of-dogs/vomiting-in-dogs',
    status: 'current',
    jurisdiction: 'Ветеринарный справочник MSD',
  },
  {
    _id: 'source-msd-digestive',
    _type: 'source',
    title: 'MSD Veterinary Manual: Introduction to Digestive Disorders of Dogs',
    url: 'https://www.msdvetmanual.com/dog-owners/digestive-disorders-of-dogs/introduction-to-digestive-disorders-of-dogs',
    status: 'current',
    jurisdiction: 'Ветеринарный справочник MSD',
  },
  {
    _id: 'source-msd-emergency-triage',
    _type: 'source',
    title:
      'MSD Veterinary Manual: Initial Triage and Resuscitation of Small Animal Emergency Patients',
    url: 'https://www.msdvetmanual.com/emergency-medicine-and-critical-care/evaluation-and-initial-treatment-of-small-animal-emergency-patients/initial-triage-and-resuscitation-of-small-animal-emergency-patients',
    status: 'current',
    jurisdiction: 'Ветеринарный справочник MSD',
  },
  {
    _id: 'source-woah-terrestrial-code-2024',
    _type: 'source',
    title: 'WOAH: Terrestrial Animal Health Code — current online edition',
    url: 'https://sont.woah.org/portal/tool?le=en',
    status: 'current',
    jurisdiction: 'Международные стандарты здоровья животных WOAH',
  },
  {
    _id: 'source-fao-dairy-health-records',
    _type: 'source',
    title: 'FAO: Health records for dairy cattle and buffalo',
    url: 'https://www.fao.org/4/t1265e/t1285e08.htm',
    status: 'current',
    jurisdiction: 'Продовольственная и сельскохозяйственная организация ООН',
  },
];

const articles = [
  {
    _id: 'article-vomiting-diarrhea-what-to-observe',
    title: 'Рвота и диарея у собаки или кошки: что важно наблюдать до осмотра',
    summary:
      'Какие изменения записать, что подготовить для врача и в каких ситуациях ожидание может быть опасным.',
    slug: 'vomiting-diarrhea-what-to-observe',
    primaryDomain: 'pet',
    riskLevel: 'STANDARD',
    reviewIntervalMonths: 12,
    sourceIds: ['source-msd-vomiting', 'source-msd-digestive', 'source-msd-emergency-triage'],
    speciesIds: ['species-dog', 'species-cat'],
    topicIds: ['topic-gi-symptoms', 'topic-observation'],
    body: [
      block(
        'intro',
        'Рвота и диарея — это признаки, а не самостоятельный диагноз. Важно наблюдать не только сам симптом, но и общее состояние, скорость изменений и возможный доступ к необычной пище, лекарствам или бытовым веществам.',
      ),
      listBlock('checklist', 'observe', 'Что записать', [
        'Когда началось и как часто повторяется.',
        'Что именно выходит: пища, жидкость, слизь, необычная окраска или примесь крови.',
        'Пьёт ли животное, удерживает ли воду и как мочится.',
        'Активность, реакцию на обращение, способность стоять и ходить.',
        'Что животное ело, могло ли добраться до мусора, растений, лекарств или химических средств.',
      ]),
      listBlock(
        'redFlagCategory',
        'red-flags',
        'Когда не стоит ждать',
        [
          'Быстрое ухудшение, выраженная слабость, потеря сознания или судороги.',
          'Затруднённое дыхание, сильная боль, заметное вздутие живота или безрезультатные позывы к рвоте.',
          'Повторная рвота или обильная диарея на фоне слабости, невозможности пить или признаков обезвоживания.',
          'Кровь в рвоте или стуле, подозрение на токсичное вещество или инородный предмет.',
        ],
        'Перечень не исчерпывающий. Отсутствие перечисленных признаков не исключает серьёзную проблему: ориентируйтесь на динамику и общее состояние.',
      ),
      listBlock('practicalActions', 'safe-now', 'Что можно сделать до осмотра', [
        'Обеспечить спокойное безопасное место и наблюдать за дыханием, сознанием и движением.',
        'Сохранить упаковку или фотографию возможного вещества и записать примерное время контакта.',
        'Подготовить фото или видео эпизода, если это безопасно, и взять образец необычного материала в закрытой упаковке.',
      ]),
      listBlock('dontDoBlock', 'dont', 'Чего не делать', [
        'Не давайте лекарства наугад и не используйте человеческие препараты.',
        'Не вызывайте рвоту самостоятельно: безопасность такого действия зависит от причины и состояния животного.',
        'Не поите и не кормите насильно, если животное плохо глотает, подавлено или активно рвёт.',
      ]),
      listBlock('nextSteps', 'next', 'Что сообщить врачу', [
        'Вид, возраст и примерную массу животного.',
        'Время начала, частоту эпизодов и изменения состояния.',
        'Рацион, лекарства, обработки и возможные контакты с токсинами или инородными предметами.',
      ]),
      safety(
        'safety',
        'Важно',
        'Материал помогает собрать наблюдения и выбрать следующий шаг. Он не заменяет осмотр и не позволяет установить причину симптомов дистанционно.',
      ),
    ],
  },
  {
    _id: 'article-vaccination-basics-dogs-cats',
    title: 'Вакцинация собак и кошек: базовые принципы',
    summary: 'Почему план вакцинации зависит от возраста, здоровья, образа жизни и местных рисков.',
    slug: 'vaccination-basics-dogs-cats',
    primaryDomain: 'pet',
    riskLevel: 'STANDARD',
    reviewIntervalMonths: 12,
    sourceIds: ['source-wsava-vaccination-2024'],
    speciesIds: ['species-dog', 'species-cat'],
    topicIds: ['topic-vaccination', 'topic-prevention'],
    body: [
      block(
        'intro',
        'Вакцинация снижает риск определённых инфекций, но подход к ней не сводится к одному календарю для всех собак и кошек. План обсуждают с ветеринарным врачом с учётом конкретного животного и среды, в которой оно живёт.',
      ),
      listBlock('checklist', 'factors', 'Что влияет на план', [
        'Возраст и этап жизни: щенок или котёнок, взрослое животное, пожилой возраст.',
        'Предыдущие прививки и доступные записи о препаратах и датах.',
        'Состояние здоровья на момент вакцинации и история реакций.',
        'Контакты с другими животными, поездки, выгул, передержка и местная эпидемиологическая ситуация.',
      ]),
      block(
        'core',
        'В рекомендациях используют понятия базовых (core) и дополнительных (non-core) вакцин. Базовые защищают от инфекций, значимых для большинства животных, а дополнительные выбирают по образу жизни и рискам. Для отдельных регионов и заболеваний значение рекомендаций может отличаться.',
      ),
      listBlock('checklist', 'records', 'Какие сведения взять на приём', [
        'Паспорт или другой доступный документ с датами и названиями вакцин.',
        'Информацию о хронических заболеваниях, недавнем недомогании и лекарствах.',
        'Описание контактов, поездок и условий содержания.',
        'Вопросы о следующем визите, наблюдении после прививки и хранении записей.',
      ]),
      safety(
        'safety',
        'Важно',
        'Конкретный препарат, интервалы и порядок вакцинации определяются ветеринарным врачом по инструкции к зарегистрированному продукту и актуальным местным рискам. Не переносите чужую схему на своё животное.',
      ),
    ],
  },
  {
    _id: 'article-parasite-prevention-plan',
    title: 'Профилактика паразитов у собак и кошек: как построить разумный план',
    summary:
      'Практический подход к профилактике блох, клещей и гельминтов с учётом образа жизни и безопасности вида.',
    slug: 'parasite-prevention-plan',
    primaryDomain: 'pet',
    riskLevel: 'STANDARD',
    reviewIntervalMonths: 12,
    sourceIds: ['source-esccap-gl1', 'source-esccap-gl3'],
    speciesIds: ['species-dog', 'species-cat'],
    topicIds: ['topic-parasites', 'topic-prevention'],
    body: [
      block(
        'intro',
        'Разумная профилактика начинается с оценки риска, а не с одинакового набора обработок для каждого животного. Блохи и клещи, гельминты и переносимые членистоногими инфекции — разные задачи, которые требуют разного подхода.',
      ),
      listBlock('checklist', 'risk', 'Что оценить', [
        'Живёт ли животное только дома или выходит на улицу.',
        'Охота, контакт с добычей, сырое мясо и доступ к почве или водоёмам.',
        'Другие животные в доме, дети и люди с особыми факторами риска.',
        'Возраст, состояние здоровья, поездки и условия региона.',
      ]),
      listBlock('practicalActions', 'plan', 'Как вести план', [
        'Записывать дату, цель обработки и использованный продукт.',
        'Проверять животное и среду при появлении блох или клещей, а не считать одну обработку решением всех проблем.',
        'Обсуждать с врачом, какие обследования или профилактические меры нужны при изменении образа жизни.',
      ]),
      listBlock('dontDoBlock', 'dont', 'Чего не делать', [
        'Не используйте средство без проверки, для какого вида и массы животных оно предназначено.',
        'Не переносите схему для собаки на кошку: безопасность препаратов видоспецифична.',
        'Не увеличивайте частоту обработок самостоятельно, если риск изменился или появились признаки недомогания.',
      ]),
      safety(
        'safety',
        'Важно',
        'Выбор продукта и режима применения должен соответствовать инструкции конкретного препарата и рекомендациям ветеринарного врача. В статье намеренно нет схем дозирования.',
      ),
    ],
  },
  {
    _id: 'article-symptom-observation-diary',
    title: 'Как наблюдать состояние животного дома: дневник симптомов',
    summary:
      'Простой дневник помогает увидеть динамику и передать врачу более точную картину состояния.',
    slug: 'symptom-observation-diary',
    primaryDomain: 'shared',
    riskLevel: 'LOW',
    reviewIntervalMonths: 18,
    sourceIds: ['source-msd-digestive', 'source-msd-emergency-triage'],
    speciesIds: [],
    topicIds: ['topic-observation'],
    body: [
      block(
        'intro',
        'Одна фотография состояния не всегда показывает направление изменений. Короткие записи с временем помогают сравнить состояние сейчас с тем, что было несколько часов назад, и подготовить полезную историю для врача.',
      ),
      listBlock('checklist', 'diary', 'Что отмечать', [
        'Время начала и изменения симптомов.',
        'Еду и воду: интерес, объём по наблюдению, рвоту после еды или питья.',
        'Мочеиспускание и стул: частоту и заметные изменения.',
        'Дыхание, подвижность, позу, реакцию на голос и прикосновение.',
        'Лекарства, обработки, необычную пищу, возможные контакты и изменения среды.',
        'Фото или короткое видео, если они помогают показать динамику и сделаны безопасно.',
      ]),
      listBlock('practicalActions', 'format', 'Как сделать записи полезными', [
        'Ставьте дату и время каждой записи.',
        'Разделяйте наблюдаемый факт и предположение о причине.',
        'Записывайте не только ухудшение, но и периоды улучшения или отсутствие изменений.',
      ]),
      safety(
        'safety',
        'Важно',
        'Дневник не заменяет обращение за помощью. Если состояние быстро ухудшается, не откладывайте получение ветеринарной помощи ради заполнения записей.',
      ),
    ],
  },
  {
    _id: 'article-farm-health-records',
    title: 'Какие записи вести в хозяйстве: болезни, обработки, вакцинация и падёж',
    summary:
      'Практичная структура записей помогает видеть изменения у отдельного животного и в группе.',
    slug: 'farm-health-records',
    primaryDomain: 'farm',
    riskLevel: 'LOW',
    reviewIntervalMonths: 18,
    sourceIds: ['source-fao-dairy-health-records', 'source-woah-terrestrial-code-2024'],
    speciesIds: [],
    topicIds: ['topic-farm', 'topic-observation', 'topic-prevention'],
    body: [
      block(
        'intro',
        'Записи в хозяйстве нужны не только для отчётности. Они помогают заметить повторяющиеся проблемы, сравнить группы и быстрее восстановить последовательность событий перед ветеринарным осмотром.',
      ),
      listBlock('checklist', 'records', 'Минимальный набор', [
        'Идентификатор животного или группы и дата.',
        'Число заболевших и число павших животных.',
        'Наблюдаемые признаки, условия содержания, изменения корма или воды.',
        'Вакцинации, противопаразитарные обработки и использованные продукты.',
        'Что было сделано, когда и как менялось состояние после этого.',
        'Фото, результаты исследований и важные сведения, которые нужно передать врачу.',
      ]),
      block(
        'group',
        'Для групповой проблемы особенно важны первый случай, скорость появления новых заболевших, распределение по помещениям или группам и общие изменения в кормлении, воде или содержании. Такие данные помогают обсуждать не только отдельное животное, но и общий фактор риска.',
      ),
      listBlock('practicalActions', 'withdrawal', 'Если использовался ветеринарный препарат', [
        'Сохраните название продукта, серию или упаковку, дату и способ применения так, как они указаны в документах или инструкции.',
        'Отдельно отметьте сведения о сроках ожидания только по официальной инструкции, назначению ветеринарного врача или применимому правовому источнику.',
        'Не переносите сроки с одного продукта, вида животного или страны на другой.',
      ]),
      safety(
        'safety',
        'Граница материала',
        'Это практическая памятка по организации записей, а не юридическая инструкция и не замена ветеринарной или нормативной консультации.',
      ),
    ],
  },
  {
    _id: 'article-educational-dog-poisoning-case',
    title: 'Учебный клинический разбор: тяжёлое отравление у собаки',
    summary:
      'Учебный сценарий о последовательности клинического мышления при тяжёлом остром состоянии.',
    slug: 'educational-dog-poisoning-case',
    primaryDomain: 'pet',
    riskLevel: 'STANDARD',
    reviewIntervalMonths: 12,
    sourceIds: ['source-msd-emergency-triage', 'source-msd-vomiting'],
    speciesIds: ['species-dog'],
    topicIds: ['topic-clinical-analysis', 'topic-observation'],
    body: [
      safety(
        'disclosure',
        'Учебный клинический разбор',
        'Сценарий создан для демонстрации клинической логики и структуры материала и не является опубликованной историей конкретного пациента.',
      ),
      block(
        'scenario',
        'Представим собаку с тяжёлым острым ухудшением, при котором возможен токсический контакт, но конкретное вещество и обстоятельства ещё не подтверждены. Ниже описана логика последовательных решений, а не протокол лечения конкретного пациента.',
      ),
      block('stabilize-heading', '1. Стабилизировать состояние', 'h3'),
      block(
        'stabilize-copy',
        'Сначала оценивают непосредственные угрозы жизни и обеспечивают базовую стабилизацию в условиях клиники. В этот момент важнее поддержать критические функции и безопасность, чем пытаться сразу назвать причину.',
      ),
      block('history-heading', '2. Уточнить возможный контакт', 'h3'),
      block(
        'history-copy',
        'Параллельно собирают сведения о времени начала, доступе к лекарствам, бытовым веществам, растениям, мусору и другим животным. Полезны упаковка, фотография вещества и точное описание того, что владелец видел.',
      ),
      block('monitor-heading', '3. Наблюдать меняющиеся риски', 'h3'),
      block(
        'monitor-copy',
        'Состояние может меняться после первичного обращения. Поэтому отслеживают сознание, дыхание, кровообращение, рвоту, судороги, боль и другие признаки, которые меняют приоритеты помощи.',
      ),
      block('support-heading', '4. Корректировать поддерживающую помощь', 'h3'),
      block(
        'support-copy',
        'Поддерживающие мероприятия выбирают по текущему состоянию и результатам осмотра. В учебном разборе не приводятся названия схем, дозы или инструкции для самостоятельного применения владельцем.',
      ),
      block('reassess-heading', '5. Повторно оценивать и продолжать наблюдение', 'h3'),
      block(
        'reassess-copy',
        'После каждого этапа оценивают ответ на помощь и ищут новые признаки. По мере улучшения переходят от стабилизации к контролю динамики, питанию, активности и плану наблюдения, который подходит конкретному животному.',
      ),
      listBlock('nextSteps', 'logic', 'Последовательность', [
        'Стабилизировать.',
        'Уточнить вероятный контакт и собрать доступные сведения.',
        'Мониторировать меняющиеся риски.',
        'Адаптировать поддерживающую помощь.',
        'Повторно оценивать состояние до устойчивого улучшения.',
      ]),
      safety(
        'limits',
        'Ограничения',
        'Этот учебный материал не подтверждает реальный случай, не приписывает лечение Полине и не заменяет срочную ветеринарную помощь. При подозрении на отравление не ждите публикации или ответа в мессенджере, если состояние быстро ухудшается.',
      ),
    ],
  },
];

const existingSettings = await logicalId(
  '*[_type == "siteSettings"]{_id}',
  {},
  'siteSettings singleton',
);
if (existingSettings && existingSettings !== 'siteSettings')
  throw new Error('M5 seed refused: siteSettings must use the singleton id siteSettings.');

const existingAuthorId = await logicalId(
  '*[_type == "author" && slug.current == "polina-izman"]{_id}',
  {},
  'author polina-izman',
);
const authorId = existingAuthorId ?? 'author-polina-izman';
const existingAuthor = await client.fetch<{ portrait?: unknown } | null>(
  '*[_type == "author" && _id == $id][0]{portrait}',
  { id: authorId },
);
let portrait = existingAuthor?.portrait;
const portraitPath = process.env.M5_PORTRAIT_PATH;
if (!portrait && portraitPath) {
  if (!existsSync(portraitPath)) throw new Error(`Portrait file does not exist: ${portraitPath}`);
  const asset = await client.assets.upload('image', createReadStream(portraitPath), {
    filename: basename(portraitPath),
  });
  portrait = { _type: 'image', asset: ref(asset._id), alt: portraitAlt };
  console.log(`Uploaded temporary portrait asset ${asset._id}.`);
}

await upsert(
  {
    _id: authorId,
    _type: 'author',
    name: 'Изман Полина Андреевна',
    role: 'Ветеринарный врач',
    slug: { _type: 'slug', current: 'polina-izman' },
    position: 'Заведующая ветеринарным участком с. Кицканы',
    shortBio:
      'Практикующий ветеринарный врач. Работа с домашними и сельскохозяйственными животными, практические материалы для владельцев и хозяйств и понятная маршрутизация в ситуациях, когда важно выбрать правильный следующий шаг.',
    bio: [
      block(
        'bio-1',
        'Я практикующий ветеринарный врач и работаю с домашними и сельскохозяйственными животными. POLINA VET — место, где я собираю практические материалы и клинические наблюдения для владельцев животных и хозяйств.',
      ),
    ],
    education: [
      {
        _key: 'education-1',
        institution: 'ПГУ им. Т. Г. Шевченко',
        field: 'Ветеринарная медицина',
      },
    ],
    ...(portrait ? { portrait } : {}),
  },
  existingAuthorId,
);

const speciesIds = new Map<string, string>();
for (const item of species) {
  const id = await logicalId(
    '*[_type == "species" && name == $name]{_id}',
    { name: item.name },
    `species ${item.name}`,
  );
  const actualId = id ?? item._id;
  speciesIds.set(item._id, actualId);
  await upsert(item, id);
}
const topicIds = new Map<string, string>();
for (const item of topics) {
  const id = await logicalId(
    '*[_type == "topic" && name == $name]{_id}',
    { name: item.name },
    `topic ${item.name}`,
  );
  const actualId = id ?? item._id;
  topicIds.set(item._id, actualId);
  await upsert(item, id);
}
const sourceIds = new Map<string, string>();
for (const item of sources) {
  const id = await logicalId(
    '*[_type == "source" && (_id == $id || url == $url)]{_id}',
    { id: item._id, url: item.url },
    `source ${item.url}`,
  );
  const actualId = id ?? item._id;
  sourceIds.set(item._id, actualId);
  await upsert(item, id, item.identifier ? [] : ['identifier']);
}

const seededArticleIds: Record<string, string> = {};
for (const article of articles) {
  const existingArticleId = await logicalId(
    '*[_type == "article" && language == "ru" && translationGroupId == $group && slug.current == $slug]{_id}',
    { group: article.slug, slug: article.slug },
    `article ${article.slug}`,
  );
  const id = existingArticleId ?? article._id;
  seededArticleIds[article.slug] = id;
  await upsert(
    {
      _id: id,
      _type: 'article',
      title: article.title,
      summary: article.summary,
      slug: { _type: 'slug', current: article.slug },
      language: 'ru',
      translationGroupId: article.slug,
      primaryDomain: article.primaryDomain,
      medicalOwner: ref(authorId),
      riskLevel: article.riskLevel,
      medicalRevision: 1,
      lastMedicalReview: reviewDate,
      reviewIntervalMonths: article.reviewIntervalMonths,
      sources: article.sourceIds.map((sourceId) => ref(sourceIds.get(sourceId) ?? sourceId)),
      species: article.speciesIds.map((speciesId) => ref(speciesIds.get(speciesId) ?? speciesId)),
      topics: article.topicIds.map((topicId) => ref(topicIds.get(topicId) ?? topicId)),
      body: article.body,
      archived: false,
      withdrawn: false,
    },
    existingArticleId,
  );
}

const settingsFields = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  title: 'POLINA VET',
  defaultLanguage: 'ru',
  primaryAuthor: ref(authorId),
  contacts: { primaryPhone: '+373 777 40970', telegramHandle: '@Polly_My' },
  location: {
    label: 'Ветеринарный участок, с. Кицканы',
    mapUrl: 'https://maps.app.goo.gl/EKB2oUzbYDr4q2pN9',
  },
  serviceModes: ['personalInquiry', 'appointment', 'fieldVisit'],
  availabilityNote:
    'Связаться можно по телефону или в Telegram. Ответ зависит от текущей занятости. Раздел «Срочно» на сайте не означает круглосуточную доступность врача.',
  featuredKnowledge: [
    ref(seededArticleIds['vomiting-diarrhea-what-to-observe']),
    ref(seededArticleIds['vaccination-basics-dogs-cats']),
    ref(seededArticleIds['farm-health-records']),
  ],
};
await upsert(settingsFields, existingSettings ?? undefined);

const clinicalCases = await client.fetch<number>('count(*[_type == "clinicalCase"])');
if (clinicalCases !== 0)
  throw new Error(`M5 invariant failed: clinicalCase count is ${clinicalCases}.`);
console.log(
  `M5 seed completed: author=${authorId}; articles=${Object.keys(seededArticleIds).length}; clinicalCases=0; portrait=${portrait ? 'present' : 'PORTRAIT IMPORT PENDING'}.`,
);
