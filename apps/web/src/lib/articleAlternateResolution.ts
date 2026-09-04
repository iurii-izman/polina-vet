import { stegaClean } from '@sanity/client/stega';
import { articleRoute, type ArticleDomain } from './articleRoute.ts';
import { isLocale, type Locale } from './i18n.ts';
import { isDiscoveryEligible } from './medical.ts';

export type ArticleForAlternates = {
  language?: string | null;
  primaryDomain?: string | null;
  slug?: string | null;
  translationGroupId?: string | null;
  translatedFrom?: {
    _id?: string | null;
    language?: string | null;
    medicalRevision?: number | null;
  } | null;
  sourceMedicalRevision?: number | null;
  medicalOwner?: unknown;
  reviewedBy?: unknown;
  riskLevel?: 'HIGH' | 'STANDARD' | 'LOW' | null;
  lastMedicalReview?: string | null;
  reviewIntervalMonths?: number | null;
  sources?: Array<{ status?: string | null } | null> | null;
  archived?: boolean | null;
  withdrawn?: boolean | null;
};

export type AlternateCandidate = {
  slug?: string | null;
  language?: string | null;
  primaryDomain?: string | null;
  translationGroupId?: string | null;
  translatedFromId?: string | null;
  translatedFromLanguage?: string | null;
  sourceMedicalRevision?: number | null;
  sourceCurrentMedicalRevision?: number | null;
  archived?: boolean | null;
  withdrawn?: boolean | null;
  riskLevel?: 'HIGH' | 'STANDARD' | 'LOW' | null;
  medicalOwner?: unknown;
  reviewedBy?: unknown;
  lastMedicalReview?: string | null;
  reviewIntervalMonths?: number | null;
  sourceStatuses?: Array<string | null> | null;
};

function isCurrent(candidate: AlternateCandidate) {
  const language = stegaClean(candidate.language ?? '');
  if (language === 'ru') {
    return (
      !candidate.translatedFromId &&
      !candidate.translatedFromLanguage &&
      candidate.sourceMedicalRevision == null
    );
  }
  return (
    stegaClean(candidate.translatedFromLanguage ?? '') === 'ru' &&
    Boolean(candidate.translatedFromId) &&
    Number.isInteger(candidate.sourceMedicalRevision) &&
    Number.isInteger(candidate.sourceCurrentMedicalRevision) &&
    candidate.sourceMedicalRevision === candidate.sourceCurrentMedicalRevision
  );
}

function isDomain(value: string): value is ArticleDomain {
  return value === 'pet' || value === 'farm' || value === 'shared';
}

function isValidSlug(value: string | null | undefined): value is string {
  return Boolean(value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value));
}

function isRouteCandidate(candidate: AlternateCandidate): boolean {
  const language = stegaClean(candidate.language ?? '');
  const primaryDomain = stegaClean(candidate.primaryDomain ?? '');
  return isLocale(language) && isDomain(primaryDomain) && isValidSlug(candidate.slug);
}

function isEligible(candidate: AlternateCandidate, now: string): boolean {
  return isDiscoveryEligible(
    {
      riskLevel: candidate.riskLevel ?? undefined,
      medicalOwner: candidate.medicalOwner,
      reviewedBy: candidate.reviewedBy,
      lastMedicalReview: candidate.lastMedicalReview ?? undefined,
      reviewIntervalMonths: candidate.reviewIntervalMonths ?? undefined,
      sourceStatuses: candidate.sourceStatuses ?? undefined,
      archived: candidate.archived ?? undefined,
      withdrawn: candidate.withdrawn ?? undefined,
    },
    now,
  );
}

function currentArticleCandidate(article: ArticleForAlternates): AlternateCandidate {
  return {
    slug: article.slug ?? null,
    language: (article.language as AlternateCandidate['language']) ?? null,
    primaryDomain: (article.primaryDomain as AlternateCandidate['primaryDomain']) ?? null,
    translationGroupId: article.translationGroupId ?? null,
    translatedFromId: article.translatedFrom?._id ?? null,
    translatedFromLanguage: article.translatedFrom?.language ?? null,
    sourceMedicalRevision: article.sourceMedicalRevision ?? null,
    sourceCurrentMedicalRevision: article.translatedFrom?.medicalRevision ?? null,
    archived: article.archived ?? null,
    withdrawn: article.withdrawn ?? null,
    riskLevel: article.riskLevel ?? null,
    medicalOwner: article.medicalOwner ?? null,
    reviewedBy: article.reviewedBy ?? null,
    lastMedicalReview: article.lastMedicalReview ?? null,
    reviewIntervalMonths: article.reviewIntervalMonths ?? null,
    sourceStatuses: (article.sources ?? []).map((source) => source?.status ?? null),
  };
}

export function resolveArticleAlternates(
  article: ArticleForAlternates,
  candidates: AlternateCandidate[],
  now: string,
): Partial<Record<Locale, string | null>> {
  const current = currentArticleCandidate(article);
  if (!isRouteCandidate(current) || !isCurrent(current) || !isEligible(current, now)) return {};

  const language = stegaClean(current.language ?? '');
  const primaryDomain = stegaClean(current.primaryDomain ?? '');
  if (!isLocale(language)) return {};
  const translationGroupId = stegaClean(current.translationGroupId ?? '');
  const alternates: Partial<Record<Locale, string | null>> = {
    [language]: articleRoute({
      language,
      primaryDomain: primaryDomain as ArticleDomain,
      slug: current.slug as string,
    }),
  };

  for (const candidate of candidates) {
    const candidateLanguage = stegaClean(candidate.language ?? '');
    const candidateDomain = stegaClean(candidate.primaryDomain ?? '');
    if (
      !isRouteCandidate(candidate) ||
      !isCurrent(candidate) ||
      !isEligible(candidate, now) ||
      candidateDomain !== primaryDomain ||
      stegaClean(candidate.translationGroupId ?? '') !== translationGroupId
    )
      continue;
    if (!isLocale(candidateLanguage)) continue;
    alternates[candidateLanguage] = articleRoute({
      language: candidateLanguage,
      primaryDomain: candidateDomain as ArticleDomain,
      slug: candidate.slug as string,
    });
  }
  return alternates;
}
