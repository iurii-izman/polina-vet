import { route, type Locale } from './i18n';

export type PrimaryNavigationKey = 'pets' | 'farm' | 'knowledge' | 'about' | 'contact';

function normalizePath(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

export function activePrimaryNavigation(
  pathname: string,
  locale: Locale,
): PrimaryNavigationKey | undefined {
  const normalizedPathname = normalizePath(pathname);
  const candidates = [
    ['pets', route.pets(locale)],
    ['farm', route.farm(locale)],
    ['knowledge', route.knowledge(locale)],
    ['about', route.about(locale)],
    ['contact', route.contact(locale)],
  ] as const;

  return candidates.find(([, href]) => {
    const normalizedHref = normalizePath(href);
    return (
      normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`)
    );
  })?.[0];
}
