import { fetchSanity } from './load-query';

import { isDiscoveryEligible } from '../medical';
import {
  ELIGIBLE_KNOWLEDGE_QUERY,
  PUBLIC_PROFILE_QUERY,
  PAGE_BY_TRANSLATION_GROUP_QUERY,
  SITE_SETTINGS_QUERY,
} from './queries';
import type {
  ELIGIBLE_KNOWLEDGE_QUERY_RESULT,
  PAGE_BY_TRANSLATION_GROUP_QUERY_RESULT,
  PUBLIC_PROFILE_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from './sanity.types';

async function fetchSiteSettings(perspectiveCookie?: string): Promise<SITE_SETTINGS_QUERY_RESULT> {
  return fetchSanity<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY, {}, perspectiveCookie);
}

let siteSettingsPromise: ReturnType<typeof fetchSiteSettings> | undefined;

export function getSiteSettings(perspectiveCookie?: string): Promise<SITE_SETTINGS_QUERY_RESULT> {
  if (perspectiveCookie) return fetchSiteSettings(perspectiveCookie);
  siteSettingsPromise ??= fetchSiteSettings();
  return siteSettingsPromise;
}

let publicProfilePromise: ReturnType<typeof fetchPublicProfile> | undefined;

async function fetchPublicProfile(
  perspectiveCookie?: string,
): Promise<PUBLIC_PROFILE_QUERY_RESULT | null> {
  const profile = await fetchSanity<PUBLIC_PROFILE_QUERY_RESULT>(
    PUBLIC_PROFILE_QUERY,
    {},
    perspectiveCookie,
  );
  if (!profile) return null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...profile,
    featuredKnowledge: (profile.featuredKnowledge ?? []).filter((article) =>
      isDiscoveryEligible(
        {
          riskLevel: article.riskLevel ?? undefined,
          medicalOwner: article.medicalOwner,
          reviewedBy: article.reviewedBy,
          lastMedicalReview: article.lastMedicalReview ?? undefined,
          reviewIntervalMonths: article.reviewIntervalMonths ?? undefined,
          sourceStatuses: article.sourceStatuses ?? undefined,
          archived: article.archived ?? undefined,
          withdrawn: article.withdrawn ?? undefined,
        },
        today,
      ),
    ),
  } as PUBLIC_PROFILE_QUERY_RESULT;
}

export function getPublicProfile(
  perspectiveCookie?: string,
): Promise<PUBLIC_PROFILE_QUERY_RESULT | null> {
  if (perspectiveCookie) return fetchPublicProfile(perspectiveCookie);
  publicProfilePromise ??= fetchPublicProfile();
  return publicProfilePromise;
}

export function getPageByTranslationGroup(
  translationGroupId: string,
  language: string,
  perspectiveCookie?: string,
): Promise<PAGE_BY_TRANSLATION_GROUP_QUERY_RESULT | null> {
  return fetchSanity<PAGE_BY_TRANSLATION_GROUP_QUERY_RESULT>(
    PAGE_BY_TRANSLATION_GROUP_QUERY,
    { language, translationGroupId },
    perspectiveCookie,
  );
}

export async function getEligibleKnowledge(
  language: string,
  now: string,
  perspectiveCookie?: string,
): Promise<ELIGIBLE_KNOWLEDGE_QUERY_RESULT> {
  const candidates = await fetchSanity<ELIGIBLE_KNOWLEDGE_QUERY_RESULT>(
    ELIGIBLE_KNOWLEDGE_QUERY,
    {
      language,
    },
    perspectiveCookie,
  );
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
