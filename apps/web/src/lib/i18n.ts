import { getRelativeLocaleUrl } from 'astro:i18n';

export const locales = ['ru', 'ro', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  ro: 'Română',
  uk: 'Українська',
};

export const publishedLocales: readonly Locale[] = ['ru'];

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isLocale(segment) ? segment : 'ru';
}

export function localeRoute(locale: Locale, path = ''): string {
  return getRelativeLocaleUrl(locale, path.replace(/^\/+|\/+$/g, ''));
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
