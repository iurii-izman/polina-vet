import { sanityClient } from 'sanity:client';

import { PAGE_BY_TRANSLATION_GROUP_QUERY, SITE_SETTINGS_QUERY } from './queries';

async function fetchSiteSettings() {
  return sanityClient.fetch(SITE_SETTINGS_QUERY);
}

let siteSettingsPromise: ReturnType<typeof fetchSiteSettings> | undefined;

export function getSiteSettings() {
  siteSettingsPromise ??= fetchSiteSettings();
  return siteSettingsPromise;
}

export function getPageByTranslationGroup(translationGroupId: string, language: string) {
  return sanityClient.fetch(PAGE_BY_TRANSLATION_GROUP_QUERY, { language, translationGroupId });
}
