import { locales, localeRoute, type Locale } from './i18n.ts';

export const coreRouteFamilies = [
  '',
  'pets',
  'farm',
  'urgent',
  'pets/urgent',
  'farm/urgent',
  'about',
  'contact',
  'pets/before-visit',
  'farm/before-vet-arrives',
  'editorial-policy',
  'knowledge',
  'task/animal-sick',
  'task/prepare',
  'farm/group-problem',
  'privacy/v1.0',
] as const;

export function coreRoutes(locale: Locale): string[] {
  return coreRouteFamilies.map((family) => localeRoute(locale, family));
}

export const requiredLocalizedCoreRoutes = locales.flatMap((locale) => coreRoutes(locale));
