import { sanityClient } from 'sanity:client';

import { isDiscoveryEligible } from '../medical';
import {
  ELIGIBLE_KNOWLEDGE_QUERY,
  PUBLIC_PROFILE_QUERY,
  PAGE_BY_TRANSLATION_GROUP_QUERY,
  SITE_SETTINGS_QUERY,
} from './queries';
import type { PUBLIC_PROFILE_QUERY_RESULT } from './sanity.types';

async function fetchSiteSettings() {
  return sanityClient.fetch(SITE_SETTINGS_QUERY);
}

let siteSettingsPromise: ReturnType<typeof fetchSiteSettings> | undefined;

export function getSiteSettings() {
  siteSettingsPromise ??= fetchSiteSettings();
  return siteSettingsPromise;
}

let publicProfilePromise: ReturnType<typeof fetchPublicProfile> | undefined;

async function fetchPublicProfile() {
  const profile = await sanityClient.fetch(PUBLIC_PROFILE_QUERY);
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
  } satisfies PUBLIC_PROFILE_QUERY_RESULT;
}

export function getPublicProfile() {
  publicProfilePromise ??= fetchPublicProfile();
  return publicProfilePromise;
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
