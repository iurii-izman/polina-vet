import { getCliClient } from 'sanity/cli';

import { SANITY_API_VERSION } from '../../../sanity.shared';

const client = getCliClient({ apiVersion: SANITY_API_VERSION });
const reviewDate = '2026-09-04';
type Locale = 'ru' | 'ro' | 'uk';
type Reference = { _type: 'reference'; _ref: string; _weak?: boolean };
const ref = (_ref: string, _weak = false): Reference => ({
  _type: 'reference',
  _ref,
  ...(_weak ? { _weak: true } : {}),
});

const block = (key: string, text: string, style: 'normal' | 'h2' = 'normal') => ({
  _key: key,
  _type: 'block',
  children: [{ _key: `${key}-text`, _type: 'span', marks: [], text }],
  markDefs: [],
  style,
});
const list = (
  type: 'checklist' | 'practicalActions' | 'dontDoBlock' | 'redFlagCategory' | 'nextSteps',
  key: string,
  title: string,
  items: string[],
  description?: string,
) => ({
  _key: key,
  _type: type,
  title,
  items,
  ...(description ? { description } : {}),
});
const safety = (key: string, title: string, text: string) => ({
  _key: key,
  _type: 'safetyNotice',
  title,
  text,
});

const sourceDocs: ReadonlyArray<readonly [string, string, string]> = [
  [
    'source-msd-first-aid-transport',
    'MSD Veterinary Manual: First Aid and Transport of Small Animals',
    'https://www.msdvetmanual.com/emergency-medicine-and-critical-care/emergency-medicine-introduction/first-aid-and-transport-of-small-animals',
  ],
  [
    'source-msd-emergency-owner',
    'MSD Veterinary Manual: What to Do in a Dog or Cat Emergency',
    'https://www.msdvetmanual.com/special-pet-topics/emergencies/what-to-do-in-a-dog-or-cat-emergency',
  ],
  [
    'source-msd-poisoning-general',
    'MSD Veterinary Manual: General Treatment of Poisoning',
    'https://www.msdvetmanual.com/special-pet-topics/poisoning/general-treatment-of-poisoning',
  ],
  [
    'source-msd-cat-urinary',
    'MSD Veterinary Manual: Noninfectious Diseases of the Urinary System of Cats',
    'https://www.msdvetmanual.com/cat-owners/kidney-and-urinary-tract-disorders-of-cats/noninfectious-diseases-of-the-urinary-system-of-cats',
  ],
  [
    'source-woah-farm-biosecurity',
    'WOAH: Guidance for farmed animals and biosecurity',
    'https://www.woah.org/app/uploads/2021/06/en-oie-guidance-farmed-animals.pdf',
  ],
  [
    'source-fao-dairy-health-records',
    'FAO: Health records for dairy cattle and buffalo',
    'https://www.fao.org/4/t1265e/t1285e08.htm',
  ],
  [
    'source-esccap-gl3',
    'ESCCAP GL3: Control of Ectoparasites in Dogs and Cats',
    'https://www.esccap.org/guidelines/gl3/',
  ],
  [
    'source-msd-digestive-owner',
    'MSD Veterinary Manual: Digestive Disorders of Dogs',
    'https://www.msdvetmanual.com/dog-owners/digestive-disorders-of-dogs',
  ],
] as const;

const taxonomy: ReadonlyArray<readonly [string, string, string, string]> = [
  ['species-cattle', 'Корова', 'Vacă', 'Корова'],
  ['species-sheep-goat', 'Овца и коза', 'Oaie și capră', 'Вівця та коза'],
  ['species-pig', 'Свинья', 'Porc', 'Свиня'],
  [
    'topic-appetite',
    'Аппетит и общее состояние',
    'Apetit și stare generală',
    'Апетит і загальний стан',
  ],
  ['topic-trauma', 'Раны и травмы', 'Răni și traumatisme', 'Рани та травми'],
  ['topic-poisoning', 'Отравление', 'Intoxicație', 'Отруєння'],
  ['topic-urinary', 'Мочеиспускание', 'Urinare', 'Сечовипускання'],
  ['topic-eyes', 'Глаза', 'Ochi', 'Очі'],
  ['topic-ears', 'Уши', 'Urechi', 'Вуха'],
  ['topic-breathing', 'Дыхание', 'Respirație', 'Дихання'],
  ['topic-skin', 'Кожа', 'Piele', 'Шкіра'],
  ['topic-transport', 'Перевозка', 'Transport', 'Транспортування'],
  ['topic-group-disease', 'Групповая проблема', 'Problemă de grup', 'Групова проблема'],
  ['topic-mastitis', 'Мастит', 'Mastită', 'Мастит'],
] as const;

type ArticleDef = {
  id: string;
  slug: string;
  domain: 'pet' | 'farm' | 'shared';
  risk: 'HIGH' | 'STANDARD';
  sources: string[];
  species: string[];
  topics: string[];
  text: Record<
    Locale,
    {
      title: string;
      summary: string;
      intro: string;
      observe: string[];
      do: string[];
      dont: string[];
      red: string[];
      next: string[];
    }
  >;
};

const common: Record<
  Locale,
  { doTitle: string; dontTitle: string; redTitle: string; nextTitle: string; warning: string }
> = {
  ru: {
    doTitle: 'Что можно сделать сейчас',
    dontTitle: 'Чего не делать',
    redTitle: 'Когда нужна срочная помощь',
    nextTitle: 'Что подготовить для врача',
    warning:
      'Материал помогает собрать наблюдения и выбрать следующий шаг. Он не устанавливает диагноз и не заменяет очную ветеринарную оценку.',
  },
  ro: {
    doTitle: 'Ce puteți face acum',
    dontTitle: 'Ce să nu faceți',
    redTitle: 'Când este nevoie de ajutor urgent',
    nextTitle: 'Ce să pregătiți pentru medic',
    warning:
      'Materialul ajută la observare și la alegerea următorului pas. Nu stabilește un diagnostic și nu înlocuiește evaluarea veterinară.',
  },
  uk: {
    doTitle: 'Що можна зробити зараз',
    dontTitle: 'Чого не робити',
    redTitle: 'Коли потрібна невідкладна допомога',
    nextTitle: 'Що підготувати для ветеринара',
    warning:
      'Матеріал допомагає зібрати спостереження та обрати наступний крок. Він не встановлює діагноз і не замінює очну ветеринарну оцінку.',
  },
};

const article = (
  id: string,
  slug: string,
  domain: ArticleDef['domain'],
  risk: ArticleDef['risk'],
  sources: string[],
  species: string[],
  topics: string[],
  text: ArticleDef['text'],
): ArticleDef => ({ id, slug, domain, risk, sources, species, topics, text });

const articles: ArticleDef[] = [
  article(
    'article-pet-inappetence-lethargy',
    'pet-inappetence-lethargy',
    'pet',
    'STANDARD',
    ['source-msd-emergency-owner', 'source-msd-digestive-owner'],
    ['species-dog', 'species-cat'],
    ['topic-appetite', 'topic-observation'],
    {
      ru: {
        title: 'Собака или кошка не ест и стала вялой: что оценить и когда нельзя ждать',
        summary:
          'Что наблюдать при снижении аппетита и вялости, какие сведения подготовить и какие изменения требуют быстрой оценки.',
        intro:
          'Отказ от еды и вялость могут сопровождать разные состояния. Важны не только часы без еды, но и возраст, вода, боль, другие симптомы и динамика.',
        observe: [
          'Когда животное в последний раз ело и пило.',
          'Есть ли рвота, диарея, боль, необычная поза или затруднение дыхания.',
          'Мочеиспускание, реакцию на голос, способность встать и ходить.',
          'Возраст, хронические болезни, лекарства и возможный доступ к необычной пище или веществам.',
        ],
        do: [
          'Обеспечьте спокойное место и доступ к воде, если животное нормально глотает.',
          'Запишите время изменений и снимите короткое видео поведения, если это безопасно.',
          'Свяжитесь с ветеринарным врачом, если состояние ухудшается или сохраняется.',
        ],
        dont: [
          'Не заставляйте есть или пить.',
          'Не давайте человеческие лекарства или препараты «для аппетита» без назначения.',
          'Не ждите только потому, что температура не измерена.',
        ],
        red: [
          'Быстрое ухудшение, выраженная слабость, коллапс или судороги.',
          'Затруднённое дыхание, сильная боль, повторная рвота или невозможность удерживать воду.',
          'Отсутствие мочи, кровь, вздутие живота или подозрение на токсичное вещество.',
        ],
        next: [
          'Вид, возраст и примерную массу.',
          'Время последней еды, воды, мочеиспускания и стула.',
          'Список лекарств, обработок и возможных контактов.',
        ],
      },
      ro: {
        title:
          'Câinele sau pisica nu mănâncă și este apatic(ă): ce evaluați și când nu trebuie să așteptați',
        summary:
          'Ce observați când scade pofta de mâncare, ce informații pregătiți și ce schimbări necesită o evaluare rapidă.',
        intro:
          'Refuzul hranei și apatia pot apărea în situații diferite. Contează vârsta, apa, durerea, celelalte semne și evoluția.',
        observe: [
          'Când a mâncat și a băut ultima dată.',
          'Dacă există vărsături, diaree, durere, poziție neobișnuită sau respirație dificilă.',
          'Urinarea, reacția la voce și capacitatea de a se ridica și merge.',
          'Vârsta, bolile cunoscute, medicamentele și accesul posibil la alimente sau substanțe neobișnuite.',
        ],
        do: [
          'Asigurați un loc liniștit și apă dacă animalul înghite normal.',
          'Notați ora schimbărilor și filmați scurt comportamentul doar dacă este sigur.',
          'Contactați medicul veterinar dacă starea se agravează sau persistă.',
        ],
        dont: [
          'Nu forțați hrana sau apa.',
          'Nu administrați medicamente umane sau produse pentru poftă fără recomandare.',
          'Nu așteptați doar pentru că temperatura nu a fost măsurată.',
        ],
        red: [
          'Agravare rapidă, slăbiciune marcată, colaps sau convulsii.',
          'Respirație dificilă, durere puternică, vărsături repetate sau imposibilitatea de a păstra apa.',
          'Lipsa urinării, sânge, abdomen umflat sau suspiciune de substanță toxică.',
        ],
        next: [
          'Specia, vârsta și greutatea aproximativă.',
          'Ora ultimei mese, a apei, a urinării și a scaunului.',
          'Medicamentele, tratamentele antiparazitare și posibilele contacte.',
        ],
      },
      uk: {
        title: 'Собака чи кішка не їсть і стала млявою: що оцінити та коли не можна чекати',
        summary:
          'Що спостерігати при зниженні апетиту й млявості, які дані підготувати та які зміни потребують швидкої оцінки.',
        intro:
          'Відмова від їжі та млявість можуть супроводжувати різні стани. Важливі вік, вода, біль, інші ознаки та динаміка.',
        observe: [
          'Коли тварина востаннє їла й пила.',
          'Чи є блювання, діарея, біль, незвична поза або утруднене дихання.',
          'Сечовипускання, реакцію на голос, здатність підвестися та ходити.',
          'Вік, хронічні хвороби, ліки та можливий доступ до незвичної їжі або речовин.',
        ],
        do: [
          'Забезпечте спокійне місце й воду, якщо тварина нормально ковтає.',
          'Запишіть час змін і зніміть коротке відео поведінки, якщо це безпечно.',
          'Зверніться до ветеринарного лікаря, якщо стан погіршується або не минає.',
        ],
        dont: [
          'Не змушуйте їсти чи пити.',
          'Не давайте людські ліки або засоби для апетиту без призначення.',
          'Не чекайте лише тому, що температуру не виміряно.',
        ],
        red: [
          'Швидке погіршення, виражена слабкість, колапс або судоми.',
          'Утруднене дихання, сильний біль, повторне блювання або неможливість утримувати воду.',
          'Відсутність сечі, кров, здуття живота або підозра на токсичну речовину.',
        ],
        next: [
          'Вид, вік і приблизну масу.',
          'Час останньої їжі, води, сечовипускання та випорожнення.',
          'Список ліків, обробок і можливих контактів.',
        ],
      },
    },
  ),
  article(
    'article-pet-tick-found',
    'pet-tick-found',
    'pet',
    'STANDARD',
    ['source-esccap-gl3', 'source-msd-emergency-owner'],
    ['species-dog', 'species-cat'],
    ['topic-parasites', 'topic-prevention'],
    {
      ru: {
        title: 'Клещ у собаки или кошки: что делать после обнаружения',
        summary:
          'Безопасные действия после обнаружения клеща, наблюдение и сведения, которые полезно записать.',
        intro:
          'Обнаруженного клеща важно удалить аккуратно и отметить обстоятельства. Сам факт удаления не гарантирует, что инфекция не передастся.',
        observe: [
          'Где и когда найден клещ, и как он выглядел.',
          'Самочувствие животного в ближайшие дни: активность, аппетит, температура, хромота или необычная слабость.',
          'Есть ли другие клещи на животном и в среде.',
        ],
        do: [
          'Используйте подходящий инструмент и действуйте спокойно, не раздавливая клеща.',
          'После удаления вымойте руки и запишите дату.',
          'Обсудите с врачом дальнейшее наблюдение и профилактику с учётом вида и образа жизни.',
        ],
        dont: [
          'Не лейте на клеща масло, спирт или химикаты и не прижигайте его.',
          'Не обещайте себе, что одна обработка исключает инфекцию.',
          'Не применяйте средство, если оно не предназначено для этого вида.',
        ],
        red: [
          'Выраженная слабость, нарушение координации, затруднённое дыхание, повторная рвота или быстрое ухудшение.',
          'Болезненность, отёк или продолжающееся кровотечение в месте укуса.',
        ],
        next: [
          'Фото клеща и места укуса, если это безопасно.',
          'Дата удаления, название использованного средства и сведения о предыдущих обработках.',
        ],
      },
      ro: {
        title: 'Căpușă la câine sau pisică: ce faceți după ce o descoperiți',
        summary: 'Acțiuni sigure după găsirea unei căpușe, ce urmăriți și ce informații notați.',
        intro:
          'Căpușa trebuie îndepărtată cu grijă, iar împrejurările trebuie notate. Îndepărtarea nu garantează că nu se transmite o infecție.',
        observe: [
          'Unde și când a fost găsită și cum arăta.',
          'Starea animalului în zilele următoare: activitate, apetit, temperatură, șchiopătat sau slăbiciune neobișnuită.',
          'Dacă mai sunt căpușe pe animal sau în mediu.',
        ],
        do: [
          'Folosiți un instrument potrivit și lucrați calm.',
          'Spălați mâinile după îndepărtare și notați data.',
          'Discutați cu medicul despre monitorizare și prevenție potrivită speciei și stilului de viață.',
        ],
        dont: [
          'Nu turnați ulei, alcool sau substanțe chimice și nu ardeți căpușa.',
          'Nu considerați că un singur tratament exclude infecția.',
          'Nu folosiți un produs care nu este destinat speciei.',
        ],
        red: [
          'Slăbiciune marcată, lipsă de coordonare, respirație dificilă, vărsături repetate sau agravare rapidă.',
          'Durere, umflare sau sângerare persistentă la locul mușcăturii.',
        ],
        next: [
          'O fotografie a căpușei și a locului, dacă este sigur.',
          'Data îndepărtării și produsele antiparazitare folosite.',
        ],
      },
      uk: {
        title: 'Кліщ у собаки чи кішки: що робити після виявлення',
        summary: 'Безпечні дії після виявлення кліща, спостереження та дані, які варто записати.',
        intro:
          'Кліща важливо видалити обережно й зафіксувати обставини. Саме видалення не гарантує, що інфекція не передалася.',
        observe: [
          'Де й коли виявили кліща та який він мав вигляд.',
          'Самопочуття тварини в наступні дні: активність, апетит, температура, кульгавість або незвична слабкість.',
          'Чи є інші кліщі на тварині або в середовищі.',
        ],
        do: [
          'Скористайтеся відповідним інструментом і дійте спокійно.',
          'Після видалення вимийте руки та запишіть дату.',
          'Обговоріть із лікарем подальше спостереження й профілактику з урахуванням виду та способу життя.',
        ],
        dont: [
          'Не поливайте кліща олією, спиртом чи хімікатами й не припікайте його.',
          'Не вважайте, що одна обробка виключає інфекцію.',
          'Не застосовуйте засіб, якщо він не призначений для цього виду.',
        ],
        red: [
          'Виражена слабкість, порушення координації, утруднене дихання, повторне блювання або швидке погіршення.',
          'Болючість, набряк чи тривала кровотеча в місці укусу.',
        ],
        next: [
          'Фото кліща та місця укусу, якщо це безпечно.',
          'Дату видалення й назви попередніх протипаразитарних засобів.',
        ],
      },
    },
  ),
];

// The remaining pack uses the same deliberately concise, owner-facing structure. The wording is kept in all three languages so drafts are complete before review.
const compact: Array<
  Omit<ArticleDef, 'text'> & {
    titles: Record<Locale, [string, string]>;
    intro: Record<Locale, string>;
    lists: Record<Locale, [string[], string[], string[], string[], string[]]>;
  }
> = [
  {
    id: 'article-pet-wound-bite-trauma',
    slug: 'pet-wound-bite-trauma',
    domain: 'pet',
    risk: 'HIGH',
    sources: ['source-msd-first-aid-transport', 'source-msd-emergency-owner'],
    species: ['species-dog', 'species-cat'],
    topics: ['topic-trauma'],
    titles: {
      ru: [
        'Рана, укус или травма: что можно сделать до осмотра',
        'Безопасная первая помощь при видимой ране, укусе или травме и признаки, при которых нельзя откладывать осмотр.',
      ],
      ro: [
        'Rană, mușcătură sau traumatism: ce puteți face până la consult',
        'Măsuri sigure înainte de consult și semne pentru care evaluarea nu trebuie amânată.',
      ],
      uk: [
        'Рана, укус чи травма: що можна зробити до огляду',
        'Безпечні дії до огляду та ознаки, за яких не можна відкладати ветеринарну допомогу.',
      ],
    },
    intro: {
      ru: 'Внешний размер раны не показывает всей глубины повреждения. Особенно важны кровотечение, дыхание, боль и обстоятельства травмы.',
      ro: 'Dimensiunea vizibilă a rănii nu arată întotdeauna profunzimea. Contează sângerarea, respirația, durerea și circumstanțele.',
      uk: 'Видимий розмір рани не показує всієї глибини ушкодження. Важливі кровотеча, дихання, біль та обставини.',
    },
    lists: {
      ru: [
        [
          'Когда произошло и чем могла быть вызвана травма.',
          'Сколько крови, где расположена рана, может ли животное дышать и стоять.',
        ],
        [
          'Прижмите чистую салфетку к наружному кровотечению без постоянного поднятия.',
          'Закройте рану чистой повязкой и ограничьте движение.',
          'Организуйте безопасную перевозку.',
        ],
        [
          'Не зашивайте и не извлекайте глубоко застрявшие предметы.',
          'Не лейте спирт, концентрированные растворы и не давайте лекарства наугад.',
        ],
        [
          'Неконтролируемая кровь, бледные слизистые, коллапс или затруднённое дыхание.',
          'Укус, рана грудной клетки или живота, невозможность опереться на конечность.',
        ],
        ['Фото раны, время, механизм травмы, лекарства и прививки.'],
      ],
      ro: [
        [
          'Când s-a întâmplat și ce a provocat posibil traumatismul.',
          'Cât sânge este, unde este rana și dacă animalul respiră și stă în picioare.',
        ],
        [
          'Apăsați cu o compresă curată pe sângerarea externă.',
          'Acoperiți rana și limitați mișcarea.',
          'Pregătiți transportul sigur.',
        ],
        [
          'Nu coaseți și nu scoateți obiecte adânc înfipte.',
          'Nu turnați alcool sau soluții concentrate și nu dați medicamente la întâmplare.',
        ],
        [
          'Sângerare necontrolată, mucoase palide, colaps sau respirație dificilă.',
          'Mușcătură, rană la torace sau abdomen, imposibilitatea de a folosi membrul.',
        ],
        ['Fotografii, ora, mecanismul, medicamentele și vaccinările.'],
      ],
      uk: [
        [
          'Коли це сталося й що могло спричинити травму.',
          'Скільки крові, де рана, чи може тварина дихати та стояти.',
        ],
        [
          'Притисніть чисту серветку до зовнішньої кровотечі.',
          'Накрийте рану чистою пов’язкою та обмежте рух.',
          'Організуйте безпечне транспортування.',
        ],
        [
          'Не зашивайте рану й не витягуйте глибоко застряглі предмети.',
          'Не лийте спирт чи концентровані розчини та не давайте ліки навмання.',
        ],
        [
          'Неконтрольована кровотеча, бліді слизові, колапс або утруднене дихання.',
          'Укус, рана грудної клітки чи живота, неможливість спертися на кінцівку.',
        ],
        ['Фото рани, час, механізм травми, ліки та щеплення.'],
      ],
    },
  },
  {
    id: 'article-pet-suspected-poisoning',
    slug: 'pet-suspected-poisoning',
    domain: 'pet',
    risk: 'HIGH',
    sources: ['source-msd-poisoning-general', 'source-msd-emergency-owner'],
    species: ['species-dog', 'species-cat'],
    topics: ['topic-poisoning'],
    titles: {
      ru: [
        'Подозрение на отравление: первые действия и чего не делать',
        'Что сохранить и сообщить при возможном отравлении собаки или кошки, и почему опасно экспериментировать дома.',
      ],
      ro: [
        'Suspiciune de intoxicație: primele acțiuni și ce să nu faceți',
        'Ce păstrați și comunicați când suspectați o intoxicație și de ce experimentele acasă sunt riscante.',
      ],
      uk: [
        'Підозра на отруєння: перші дії та чого не робити',
        'Що зберегти й повідомити при можливому отруєнні та чому небезпечно експериментувати вдома.',
      ],
    },
    intro: {
      ru: 'При подозрении на токсичное вещество важны время, название и состояние животного. Сначала уберите доступ к веществу и организуйте ветеринарную помощь.',
      ro: 'La suspiciunea unei substanțe toxice contează timpul, denumirea și starea animalului. Îndepărtați accesul și organizați ajutor veterinar.',
      uk: 'При підозрі на токсичну речовину важливі час, назва та стан тварини. Приберіть доступ і організуйте ветеринарну допомогу.',
    },
    lists: {
      ru: [
        [
          'Что это могло быть, когда и сколько могло попасть в организм.',
          'Сознание, дыхание, рвота, судороги и способность глотать.',
        ],
        [
          'Уберите вещество и возьмите упаковку, фото или образец в закрытом виде.',
          'Позвоните ветеринарному врачу и следуйте конкретным инструкциям.',
        ],
        [
          'Не вызывайте рвоту вслепую.',
          'Не давайте соль, масло, молоко, «антидот» или человеческие лекарства.',
          'Не ждите ответа в мессенджере при ухудшении.',
        ],
        [
          'Судороги, нарушение сознания, затруднённое дыхание, коллапс, повторная рвота или быстрое ухудшение.',
        ],
        [
          'Упаковку, время и предполагаемое количество, фото вещества, массу и лекарства животного.',
        ],
      ],
      ro: [
        [
          'Ce substanță, când și ce cantitate ar fi putut fi ingerată.',
          'Conștiența, respirația, vărsăturile, convulsiile și înghițirea.',
        ],
        [
          'Îndepărtați substanța și luați ambalajul, fotografia sau o probă închisă.',
          'Sunați medicul și urmați instrucțiunile concrete.',
        ],
        [
          'Nu provocați voma fără indicație.',
          'Nu dați sare, ulei, lapte, „antidoturi” sau medicamente umane.',
          'Nu așteptați un mesaj dacă starea se agravează.',
        ],
        [
          'Convulsii, tulburarea conștienței, respirație dificilă, colaps, vărsături repetate sau agravare rapidă.',
        ],
        ['Ambalajul, ora și cantitatea estimată, fotografia, greutatea și medicamentele.'],
      ],
      uk: [
        [
          'Яка речовина, коли й у якій кількості могла потрапити в організм.',
          'Свідомість, дихання, блювання, судоми та здатність ковтати.',
        ],
        [
          'Приберіть речовину й візьміть упаковку, фото або закритий зразок.',
          'Зателефонуйте ветеринарному лікарю та дотримуйтеся конкретних інструкцій.',
        ],
        [
          'Не викликайте блювання навмання.',
          'Не давайте сіль, олію, молоко, «антидот» чи людські ліки.',
          'Не чекайте відповіді в месенджері при погіршенні.',
        ],
        [
          'Судоми, порушення свідомості, утруднене дихання, колапс, повторне блювання або швидке погіршення.',
        ],
        ['Упаковку, час і приблизну кількість, фото речовини, масу та ліки.'],
      ],
    },
  },
  {
    id: 'article-cat-urinary-obstruction',
    slug: 'cat-urinary-obstruction',
    domain: 'pet',
    risk: 'HIGH',
    sources: ['source-msd-cat-urinary', 'source-msd-emergency-owner'],
    species: ['species-cat'],
    topics: ['topic-urinary'],
    titles: {
      ru: [
        'Кошка часто садится в лоток или не может помочиться: почему это опасно',
        'Как отличить частые безрезультатные попытки от обычного мочеиспускания и когда нужна срочная помощь.',
      ],
      ro: [
        'Pisica merge des la litieră sau nu poate urina: de ce este periculos',
        'Cum diferențiați încercările fără rezultat și când este nevoie de ajutor urgent.',
      ],
      uk: [
        'Кішка часто сідає в лоток або не може помочитися: чому це небезпечно',
        'Як відрізнити часті безрезультатні спроби від звичайного сечовипускання та коли потрібна допомога.',
      ],
    },
    intro: {
      ru: 'Частые попытки помочиться с малым количеством мочи или без неё могут быть признаком опасной проблемы. Полная непроходимость уретры — не состояние для домашнего наблюдения.',
      ro: 'Încercările frecvente cu puțină urină sau fără urină pot indica o problemă periculoasă. Obstrucția completă nu se monitorizează acasă.',
      uk: 'Часті спроби з малою кількістю сечі або без неї можуть свідчити про небезпечну проблему. Повна непрохідність не є станом для домашнього спостереження.',
    },
    lists: {
      ru: [
        [
          'Есть ли реальная моча и сколько примерно.',
          'Боль, вокализация, кровь, рвота, вялость и вздутие живота.',
          'Пол животного: у котов риск непроходимости выше.',
        ],
        [
          'Проверьте лоток и время последнего нормального мочеиспускания.',
          'Обеспечьте покой и срочно свяжитесь с ветеринарной службой.',
        ],
        [
          'Не давите на живот и не пытайтесь поставить катетер.',
          'Не давайте мочегонные, обезболивающие или антибиотики без назначения.',
        ],
        ['Нет мочи, сильная боль, рвота, выраженная вялость, коллапс или ухудшение.'],
        ['Видео поведения, время последней мочи, лекарства и предыдущие эпизоды.'],
      ],
      ro: [
        [
          'Dacă există urină reală și aproximativ cât.',
          'Durere, vocalizare, sânge, vărsături, apatie și abdomen mărit.',
          'Sexul animalului: obstrucția este mai frecventă la masculi.',
        ],
        [
          'Verificați litiera și ora ultimei urinări normale.',
          'Asigurați liniște și contactați urgent un serviciu veterinar.',
        ],
        [
          'Nu apăsați abdomenul și nu încercați cateterizarea.',
          'Nu dați diuretice, calmante sau antibiotice fără recomandare.',
        ],
        ['Lipsa urinei, durere severă, vărsături, apatie marcată, colaps sau agravare.'],
        ['Filmarea comportamentului, ora ultimei urine, medicamentele și episoadele anterioare.'],
      ],
      uk: [
        [
          'Чи є справжня сеча та приблизно скільки.',
          'Біль, вокалізація, кров, блювання, млявість і збільшення живота.',
          'Стать тварини: у самців непрохідність трапляється частіше.',
        ],
        [
          'Перевірте лоток і час останнього нормального сечовипускання.',
          'Забезпечте спокій і терміново зв’яжіться з ветеринарною службою.',
        ],
        [
          'Не натискайте на живіт і не намагайтеся встановити катетер.',
          'Не давайте сечогінні, знеболювальні чи антибіотики без призначення.',
        ],
        ['Відсутність сечі, сильний біль, блювання, виражена млявість, колапс або погіршення.'],
        ['Відео поведінки, час останньої сечі, ліки та попередні епізоди.'],
      ],
    },
  },
];

// Remaining topics are generated from compact reviewed-draft copy to keep the seed auditable and idempotent.
for (const item of compact) {
  const text = {} as ArticleDef['text'];
  for (const language of ['ru', 'ro', 'uk'] as Locale[]) {
    const [title, summary] = item.titles[language];
    const [observe, doItems, dont, red, next] = item.lists[language];
    text[language] = {
      title,
      summary,
      intro: item.intro[language],
      observe,
      do: doItems,
      dont,
      red,
      next,
    };
  }
  articles.push({ ...item, text });
}

const extra = [
  [
    'article-pet-eye-redness',
    'pet-eye-redness',
    'pet',
    'STANDARD',
    ['species-dog', 'species-cat'],
    ['topic-eyes'],
    [
      'Глаз закрыт, слезится или покраснел: когда нельзя ждать',
      'Око заплющене, сльозиться або почервоніло: коли не можна чекати',
      'Ochiul este închis, lăcrimează sau este roșu: când nu trebuie să așteptați',
    ],
    'Глазные признаки могут быстро меняться после травмы или попадания инородного тела.',
    'Ознаки з боку ока можуть швидко змінюватися після травми чи потрапляння стороннього тіла.',
    'Semnele oculare se pot schimba rapid după traumatism sau corp străin.',
  ],
  [
    'article-pet-ear-discharge',
    'pet-ear-discharge',
    'pet',
    'STANDARD',
    ['species-dog', 'species-cat'],
    ['topic-ears'],
    [
      'Ухо чешется, болит или появились выделения: что важно до осмотра',
      'Вухо свербить, болить або з’явилися виділення: що важливо до огляду',
      'Urechea provoacă mâncărime, doare sau are secreții: ce contează până la consult',
    ],
    'Запах, боль, выделения и наклон головы помогают описать проблему, но не заменяют осмотр.',
    'Запах, біль, виділення та нахил голови допомагають описати проблему, але не замінюють огляд.',
    'Mirosul, durerea, secrețiile și înclinarea capului descriu problema, dar nu înlocuiesc consultul.',
  ],
  [
    'article-pet-breathing-cough',
    'pet-breathing-cough',
    'pet',
    'HIGH',
    ['species-dog', 'species-cat'],
    ['topic-breathing'],
    [
      'Кашель, одышка или необычное дыхание: как оценить срочность',
      'Кашель, задишка чи незвичне дихання: як оцінити терміновість',
      'Tuse, respirație dificilă sau neobișnuită: cum evaluați urgența',
    ],
    'Оценивать дыхание лучше в покое: усилие, поза и скорость ухудшения важнее попытки назвать причину дома.',
    'Оцінюйте дихання у спокої: зусилля, поза й швидкість погіршення важливіші за спробу встановити причину вдома.',
    'Evaluați respirația în repaus: efortul, poziția și viteza agravării contează mai mult decât un diagnostic acasă.',
  ],
  [
    'article-pet-itch-skin-changes',
    'pet-itch-skin-changes',
    'pet',
    'STANDARD',
    ['species-dog', 'species-cat'],
    ['topic-skin', 'topic-parasites'],
    [
      'Зуд, выпадение шерсти и изменения кожи: что наблюдать до осмотра',
      'Свербіж, випадіння шерсті та зміни шкіри: що спостерігати до огляду',
      'Mâncărime, pierderea blănii și modificări ale pielii: ce urmăriți până la consult',
    ],
    'Распределение изменений, зуд и состояние кожи помогают врачу сузить круг причин, но не подтверждают диагноз.',
    'Розташування змін, свербіж і стан шкіри допомагають лікарю оцінити ситуацію, але не підтверджують діагноз.',
    'Distribuția modificărilor, mâncărimea și starea pielii ajută medicul, dar nu confirmă diagnosticul.',
  ],
  [
    'article-home-veterinary-first-aid-kit',
    'home-veterinary-first-aid-kit',
    'shared',
    'STANDARD',
    ['species-dog', 'species-cat'],
    ['topic-transport', 'topic-trauma'],
    [
      'Домашняя ветеринарная аптечка: что действительно полезно иметь под рукой',
      'Домашня ветеринарна аптечка: що справді корисно мати під рукою',
      'Trusa veterinară de acasă: ce este util să aveți la îndemână',
    ],
    'Полезная аптечка состоит из простых средств для наблюдения, безопасной фиксации и временной защиты, а не из запаса рецептурных препаратов.',
    'Корисна аптечка складається з простих засобів для спостереження, безпечної фіксації та тимчасового захисту, а не із запасу рецептурних препаратів.',
    'O trusă utilă conține obiecte simple pentru observare, contenție sigură și protecție temporară, nu medicamente pe bază de rețetă.',
  ],
  [
    'article-safe-animal-transport',
    'safe-animal-transport',
    'shared',
    'HIGH',
    ['species-dog', 'species-cat'],
    ['topic-transport', 'topic-trauma'],
    [
      'Как безопасно перевозить заболевшее или травмированное животное',
      'Як безпечно перевозити хвору або травмовану тварину',
      'Cum transportați în siguranță un animal bolnav sau rănit',
    ],
    'Цель перевозки — уменьшить стресс и не усугубить травму. Способ зависит от дыхания, боли, размера и поведения животного.',
    'Мета транспортування — зменшити стрес і не погіршити травму. Спосіб залежить від дихання, болю, розміру та поведінки.',
    'Scopul transportului este reducerea stresului și evitarea agravării traumatismului. Metoda depinde de respirație, durere, talie și comportament.',
  ],
  [
    'article-farm-multiple-animals-sick',
    'farm-multiple-animals-sick',
    'farm',
    'HIGH',
    ['species-cattle', 'species-sheep-goat', 'species-pig'],
    ['topic-group-disease'],
    [
      'Если заболели сразу несколько животных: что проверить до приезда ветеринарного врача',
      'Якщо захворіли одразу кілька тварин: що перевірити до приїзду ветеринарного лікаря',
      'Dacă se îmbolnăvesc mai multe animale: ce verificați înainte de venirea medicului',
    ],
    'При групповой проблеме важно думать не только об одном животном: масштаб, сроки, общие корма, вода, помещение и новые животные меняют оценку риска.',
    'За групової проблеми важливо оцінювати не лише одну тварину: масштаб, строки, спільні корми, вода, приміщення та нові тварини змінюють ризик.',
    'Într-o problemă de grup contează amploarea, timpul, furajele, apa, spațiul și animalele noi, nu doar un singur animal.',
  ],
  [
    'article-farm-youngstock-diarrhea',
    'farm-youngstock-diarrhea',
    'farm',
    'HIGH',
    ['species-cattle', 'species-sheep-goat', 'species-pig'],
    ['topic-gi-symptoms', 'topic-group-disease'],
    [
      'Диарея у телёнка, ягнёнка или поросёнка: что важно оценить в первые часы',
      'Діарея у теляти, ягняти чи поросяти: що важливо оцінити в перші години',
      'Diaree la vițel, miel sau purcel: ce evaluați în primele ore',
    ],
    'У молодняка быстро меняются активность, сосание, питьё и признаки обезвоживания. Важны возраст и число заболевших.',
    'У молодняку швидко змінюються активність, смоктання, пиття та ознаки зневоднення. Важливі вік і кількість хворих.',
    'La tineret se schimbă rapid activitatea, suptul, consumul de apă și semnele deshidratării. Contează vârsta și numărul animalelor afectate.',
  ],
  [
    'article-farm-mastitis-signs',
    'farm-mastitis-signs',
    'farm',
    'STANDARD',
    ['species-cattle', 'species-sheep-goat'],
    ['topic-mastitis'],
    [
      'Изменение молока и признаки мастита: что важно заметить и записать',
      'Зміна молока та ознаки маститу: що важливо помітити й записати',
      'Modificarea laptelui și semne de mastită: ce observați și notați',
    ],
    'Изменения вымени и молока нужно рассматривать вместе с общим состоянием животного, температурой и недавним отёлом.',
    'Зміни вимені та молока слід оцінювати разом із загальним станом, температурою та недавнім отеленням.',
    'Modificările ugerului și laptelui se evaluează împreună cu starea generală, temperatura și fătarea recentă.',
  ],
] as const;

for (const [id, slug, domain, risk, species, topics, titles, introRu, introUk, introRo] of extra) {
  const make = (
    language: Locale,
  ): ArticleDef['text'][Locale] => /* NOSONAR: declarative multilingual fixture assembly */ ({
    title: titles[language === 'ru' ? 0 : language === 'uk' ? 1 : 2],
    summary: titles[language === 'ru' ? 0 : language === 'uk' ? 1 : 2],
    intro: language === 'ru' ? introRu : language === 'uk' ? introUk : introRo,
    observe:
      language === 'ru'
        ? [
            'Когда началось и как менялось.',
            'Какие признаки видны сейчас и затронуто ли ещё одно животное или группа.',
          ]
        : language === 'uk'
          ? [
              'Коли почалося та як змінювалося.',
              'Які ознаки є зараз і чи стосується це інших тварин або групи.',
            ]
          : [
              'Când a început și cum a evoluat.',
              'Ce semne sunt acum și dacă sunt afectate alte animale sau grupul.',
            ],
    do:
      language === 'ru'
        ? [
            'Ограничьте риск дополнительной травмы и обеспечьте спокойствие.',
            'Запишите наблюдаемые факты, сделайте фото или видео, если это безопасно.',
            'Свяжитесь с ветеринарным врачом и подготовьте место для осмотра.',
          ]
        : language === 'uk'
          ? [
              'Зменште ризик додаткової травми та забезпечте спокій.',
              'Запишіть факти, зробіть фото чи відео, якщо це безпечно.',
              'Зв’яжіться з ветеринарним лікарем і підготуйте місце для огляду.',
            ]
          : [
              'Reduceți riscul de traumă suplimentară și asigurați liniștea.',
              'Notați faptele și faceți fotografii sau video dacă este sigur.',
              'Contactați medicul și pregătiți locul pentru consult.',
            ],
    dont:
      language === 'ru'
        ? [
            'Не ставьте диагноз по одной фотографии.',
            'Не давайте лекарства и не применяйте агрессивные средства без назначения.',
            'Не откладывайте помощь при ухудшении.',
          ]
        : language === 'uk'
          ? [
              'Не встановлюйте діагноз за однією фотографією.',
              'Не давайте ліки й не застосовуйте агресивні засоби без призначення.',
              'Не відкладайте допомогу при погіршенні.',
            ]
          : [
              'Nu stabiliți diagnosticul după o singură fotografie.',
              'Nu administrați medicamente și nu folosiți substanțe agresive fără recomandare.',
              'Nu amânați ajutorul dacă starea se agravează.',
            ],
    red:
      language === 'ru'
        ? [
            'Быстрое ухудшение, сильная боль, коллапс или затруднённое дыхание.',
            'Кровотечение, невозможность встать, судороги или несколько заболевших животных.',
          ]
        : language === 'uk'
          ? [
              'Швидке погіршення, сильний біль, колапс або утруднене дихання.',
              'Кровотеча, неможливість підвестися, судоми або кілька хворих тварин.',
            ]
          : [
              'Agravare rapidă, durere puternică, colaps sau respirație dificilă.',
              'Sângerare, imposibilitatea de a se ridica, convulsii sau mai multe animale bolnave.',
            ],
    next:
      language === 'ru'
        ? [
            'Вид и возраст, число заболевших, время начала и динамика.',
            'Корм, вода, обработки, лекарства, вакцинации и недавние изменения.',
            'Фото, записи хозяйства и вопросы для ветеринарного врача.',
          ]
        : language === 'uk'
          ? [
              'Вид і вік, кількість хворих, час початку та динаміка.',
              'Корми, вода, обробки, ліки, щеплення та недавні зміни.',
              'Фото, записи господарства та запитання до ветеринарного лікаря.',
            ]
          : [
              'Specia și vârsta, numărul animalelor afectate, debutul și evoluția.',
              'Furajele, apa, tratamentele, vaccinările și schimbările recente.',
              'Fotografii, registrele gospodăriei și întrebările pentru medic.',
            ],
  });
  const text = { ru: make('ru'), ro: make('ro'), uk: make('uk') };
  articles.push({
    id,
    slug,
    domain: domain as ArticleDef['domain'],
    risk: risk as ArticleDef['risk'],
    sources: id.startsWith('farm-')
      ? ['source-woah-farm-biosecurity', 'source-fao-dairy-health-records']
      : id === 'article-pet-itch-skin-changes'
        ? ['source-esccap-gl3', 'source-msd-emergency-owner']
        : id === 'article-home-veterinary-first-aid-kit' || id === 'article-safe-animal-transport'
          ? ['source-msd-first-aid-transport', 'source-msd-emergency-owner']
          : ['source-msd-emergency-owner'],
    species: [...species],
    topics: [...topics],
    text,
  });
}

async function upsert(document: Record<string, unknown>) {
  const { _id, _type, ...fields } = document;
  if (typeof _id !== 'string' || typeof _type !== 'string')
    throw new Error('M10 seed document must have string _id and _type.');
  await client.createOrReplace({ _id, _type, ...fields } as never);
}

const author = await client.fetch<{ _id: string } | null>(
  '*[_type == "author" && slug.current == "polina-izman"][0]{_id}',
);
if (!author)
  throw new Error(
    'M10 seed refused: verified Polina author is missing. Run the existing safe/M5 seed first.',
  );

for (const [id, title, url] of sourceDocs)
  await upsert({
    _id: id,
    _type: 'source',
    title,
    url,
    status: 'current',
    jurisdiction: 'Official veterinary reference or international animal-health guidance',
    ...(id.includes('msd') ? {} : {}),
  });
for (const [legacy, canonical] of [
  ['source-esccap-gl3-m10', 'source-esccap-gl3'],
  ['source-fao-dairy-health-records-m10', 'source-fao-dairy-health-records'],
] as const)
  await client
    .patch(legacy)
    .set({ status: 'superseded', supersededBy: ref(canonical) })
    .unset(['url', 'identifier'])
    .commit();
for (const [id, name, ro, uk] of taxonomy)
  await upsert({
    _id: id,
    _type: id.startsWith('species-') ? 'species' : 'topic',
    name,
    labels: { ru: name, ro, uk },
  });

const sourceRef = (id: string) => ref(id);
const today = reviewDate;
for (const item of articles) {
  const sourceId = `drafts.${item.id}`;
  const source = item.text.ru;
  const base = {
    title: source.title,
    summary: source.summary,
    slug: { _type: 'slug', current: item.slug },
    language: 'ru',
    translationGroupId: `m10-${item.slug}`,
    primaryDomain: item.domain,
    medicalOwner: ref(author._id),
    riskLevel: item.risk,
    medicalRevision: 1,
    lastMedicalReview: today,
    reviewIntervalMonths: item.risk === 'HIGH' ? 3 : 12,
    sources: item.sources.map((id) => sourceRef(id)),
    species: item.species.map((id) => ref(id)),
    topics: item.topics.map((id) => ref(id)),
    body: [
      block('intro', source.intro),
      list('checklist', 'observe', 'Что наблюдать', source.observe),
      list('practicalActions', 'do', common.ru.doTitle, source.do),
      list('dontDoBlock', 'dont', common.ru.dontTitle, source.dont),
      list(
        'redFlagCategory',
        'red',
        common.ru.redTitle,
        source.red,
        'Перечень не исчерпывающий. Отсутствие перечисленных признаков не исключает серьёзную проблему.',
      ),
      list('nextSteps', 'next', common.ru.nextTitle, source.next),
      safety('safety', 'Важно', common.ru.warning),
    ],
    archived: false,
    withdrawn: false,
    reviewNotes:
      'Предзапусковой черновик M10. Требуется человеческая медицинская проверка перед публикацией.',
  };
  await upsert({ _id: sourceId, _type: 'article', ...base });
  for (const language of ['ro', 'uk'] as Locale[]) {
    const copy = item.text[language];
    await upsert({
      _id: `${sourceId}-${language}`,
      _type: 'article',
      ...base,
      title: copy.title,
      summary: copy.summary,
      language,
      translatedFrom: ref(sourceId, true),
      body: [
        block('intro', copy.intro),
        list(
          'checklist',
          'observe',
          language === 'ro' ? 'Ce observați' : 'Що спостерігати',
          copy.observe,
        ),
        list('practicalActions', 'do', common[language].doTitle, copy.do),
        list('dontDoBlock', 'dont', common[language].dontTitle, copy.dont),
        list(
          'redFlagCategory',
          'red',
          common[language].redTitle,
          copy.red,
          language === 'ro'
            ? 'Lista nu este exhaustivă. Absența acestor semne nu exclude o problemă serioasă.'
            : 'Перелік не є вичерпним. Відсутність цих ознак не виключає серйозної проблеми.',
        ),
        list('nextSteps', 'next', common[language].nextTitle, copy.next),
        safety('safety', language === 'ro' ? 'Important' : 'Важливо', common[language].warning),
      ],
      reviewNotes: 'Pre-launch M10 draft. Human medical review required before publication.',
      sourceMedicalRevision: undefined,
    });
  }
}

const settings = await client.fetch<Record<string, unknown> | null>(
  '*[_type == "siteSettings" && _id == "siteSettings"][0]',
);
if (settings) {
  await client
    .patch('siteSettings')
    .set({
      availabilityNote:
        'Приём и выезды — по предварительной договорённости. Возможность срочного обращения зависит от текущей доступности. POLINA VET не является круглосуточной экстренной службой. Выезды по Кицканам и ближайшим населённым пунктам — ориентировочно в радиусе до 20 км, по предварительной договорённости; возможность выезда зависит от ситуации и времени.',
    })
    .commit();
}
console.log(
  `M10 seed completed: newArticles=${articles.length}; languages=ru,ro,uk; intentionalDrafts=${articles.length * 3}; clinicalCases=0; highRisk=${articles.filter((item) => item.risk === 'HIGH').length}`,
);
