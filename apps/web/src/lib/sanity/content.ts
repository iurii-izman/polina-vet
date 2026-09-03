import { sanityClient } from 'sanity:client';

import { isDiscoveryEligible } from '../medical';
import {
  ELIGIBLE_KNOWLEDGE_QUERY,
  PAGE_BY_TRANSLATION_GROUP_QUERY,
  SITE_SETTINGS_QUERY,
} from './queries';

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

export async function getEligibleKnowledge(language: string, now: string) {
  const candidates = await sanityClient.fetch(ELIGIBLE_KNOWLEDGE_QUERY, { language });
  return candidates.filter((article) =>
    isDiscoveryEligible(
      {
        riskLevel: article.riskLevel ?? undefined,
        medicalOwner: article.medicalOwner,
        reviewedBy: article.reviewedBy,
        lastMedicalReview: article.lastMedicalReview ?? undefined,
        reviewIntervalMonths: article.reviewIntervalMonths ?? undefined,
        sourceStatuses: article.sourceStatuses ?? undefined,
      },
      now,
    ),
  );
}
