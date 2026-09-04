export const locales = ['ru', 'ro', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  ro: 'Română',
  uk: 'Українська',
};
/** @deprecated Use contextualAlternates; retained for existing integrations. */
export const publishedLocales: readonly Locale[] = locales;

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isLocale(segment) ? segment : 'ru';
}

export function localeRoute(locale: Locale, path = ''): string {
  let cleanPath = path.replace(/^\/+/, '');
  while (cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
  const suffix = cleanPath ? `${cleanPath}/` : '';
  return `/${locale}/${suffix}`;
}

export const route = {
  home: (locale: Locale) => localeRoute(locale),
  pets: (locale: Locale) => localeRoute(locale, 'pets'),
  farm: (locale: Locale) => localeRoute(locale, 'farm'),
  knowledge: (locale: Locale) => localeRoute(locale, 'knowledge'),
  about: (locale: Locale) => localeRoute(locale, 'about'),
  contact: (locale: Locale) => localeRoute(locale, 'contact'),
  editorialPolicy: (locale: Locale) => localeRoute(locale, 'editorial-policy'),
  urgent: (locale: Locale) => localeRoute(locale, 'urgent'),
  petUrgent: (locale: Locale) => localeRoute(locale, 'pets/urgent'),
  farmUrgent: (locale: Locale) => localeRoute(locale, 'farm/urgent'),
  beforeVisit: (locale: Locale) => localeRoute(locale, 'pets/before-visit'),
  beforeVetArrives: (locale: Locale) => localeRoute(locale, 'farm/before-vet-arrives'),
  animalSick: (locale: Locale) => localeRoute(locale, 'task/animal-sick'),
  prepare: (locale: Locale) => localeRoute(locale, 'task/prepare'),
  groupProblem: (locale: Locale) => localeRoute(locale, 'farm/group-problem'),
};

/** Static route families are explicit so the switcher never guesses by replacing a path prefix. */
const staticRouteFamilies = new Set([
  '',
  'pets',
  'farm',
  'knowledge',
  'urgent',
  'pets/urgent',
  'farm/urgent',
  'about',
  'contact',
  'editorial-policy',
  'pets/before-visit',
  'farm/before-vet-arrives',
  'task/animal-sick',
  'task/prepare',
  'farm/group-problem',
]);

export function routeFamily(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  const family = parts.join('/');
  return staticRouteFamilies.has(family) ? family : null;
}

export function staticAlternates(pathname: string): Partial<Record<Locale, string>> {
  const family = routeFamily(pathname);
  if (family === null) return {};
  return Object.fromEntries(
    locales.map((locale) => [locale, localeRoute(locale, family)]),
  ) as Partial<Record<Locale, string>>;
}

export function contextualAlternates(input: {
  pathname: string;
  locale?: Locale;
  alternates?: Partial<Record<Locale, string | null>>;
}): Partial<Record<Locale, string | null>> {
  if (input.alternates) return input.alternates;
  return staticAlternates(input.pathname);
}

export const ui = {
  ru: {
    nav: {
      pets: 'Домашние животные',
      farm: 'Ферма',
      knowledge: 'Знания',
      about: 'О Полине',
      contact: 'Контакты',
    },
    footerContact: 'Контакты и доступность',
    footerPolicy: 'Редакционная политика',
    urgent: 'Срочно: что делать',
    urgentShort: 'Срочно',
    language: 'Язык',
    chooseLanguage: 'Выбрать язык',
    menu: 'Меню',
    openMenu: 'Открыть меню',
    skip: 'Перейти к содержанию',
    unavailable: 'версия не опубликована',
    articleUnavailable: 'версия не опубликована',
    brandLabel: 'POLINA VET — главная',
    footerDescription:
      'Ветеринарная информация и практические материалы для владельцев животных и хозяйств.',
    footerBoundary: 'POLINA VET не является круглосуточной экстренной службой.',
    description:
      'Практическая ветеринарная информация для владельцев домашних и сельскохозяйственных животных.',
  },
  ro: {
    nav: {
      pets: 'Animale de companie',
      farm: 'Fermă',
      knowledge: 'Cunoștințe',
      about: 'Despre Polina',
      contact: 'Contact',
    },
    footerContact: 'Contact și disponibilitate',
    footerPolicy: 'Politica editorială',
    urgent: 'Urgent: ce este de făcut',
    urgentShort: 'Urgent',
    language: 'Limbă',
    chooseLanguage: 'Alegeți limba',
    menu: 'Meniu',
    openMenu: 'Deschideți meniul',
    skip: 'Treceți la conținut',
    unavailable: 'versiunea nu este publicată',
    articleUnavailable: 'versiunea nu este publicată',
    brandLabel: 'POLINA VET — pagina principală',
    footerDescription:
      'Informații veterinare și materiale practice pentru proprietarii de animale și gospodării.',
    footerBoundary: 'POLINA VET nu este un serviciu veterinar de urgență disponibil 24/7.',
    description:
      'Informații veterinare practice pentru proprietarii animalelor de companie și ai animalelor din gospodărie.',
  },
  uk: {
    nav: {
      pets: 'Домашні тварини',
      farm: 'Ферма',
      knowledge: 'Знання',
      about: 'Про Поліну',
      contact: 'Контакти',
    },
    footerContact: 'Контакти та доступність',
    footerPolicy: 'Редакційна політика',
    urgent: 'Терміново: що робити',
    urgentShort: 'Терміново',
    language: 'Мова',
    chooseLanguage: 'Вибрати мову',
    menu: 'Меню',
    openMenu: 'Відкрити меню',
    skip: 'Перейти до вмісту',
    unavailable: 'версію ще не опубліковано',
    articleUnavailable: 'версію ще не опубліковано',
    brandLabel: 'POLINA VET — головна',
    footerDescription:
      'Ветеринарна інформація та практичні матеріали для власників тварин і господарств.',
    footerBoundary: 'POLINA VET не є цілодобовою ветеринарною екстреною службою.',
    description:
      'Практична ветеринарна інформація для власників домашніх і сільськогосподарських тварин.',
  },
} as const;

export type UiStrings = (typeof ui)[Locale];
