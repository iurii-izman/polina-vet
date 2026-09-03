import { articleRoute, type ArticleDomain } from './articleRoute';
import { isLocale, type Locale } from './i18n';
import { fetchSanity } from './sanity/load-query';
import { ARTICLE_ALTERNATES_QUERY } from './sanity/queries';
import type { ARTICLE_ALTERNATES_QUERY_RESULT } from './sanity/sanity.types';
import { stegaClean } from '@sanity/client/stega';

function isCurrent(candidate: ARTICLE_ALTERNATES_QUERY_RESULT[number]) {
  if (stegaClean(candidate.language ?? '') === 'ru') return candidate.sourceMedicalRevision == null;
  return (
    Number.isInteger(candidate.sourceMedicalRevision) &&
    Number.isInteger(candidate.sourceCurrentMedicalRevision) &&
    candidate.sourceMedicalRevision === candidate.sourceCurrentMedicalRevision
  );
}

export async function getArticleAlternates(
  article: {
    language?: string | null;
    primaryDomain?: string | null;
    slug?: string | null;
    translationGroupId?: string | null;
  },
  perspectiveCookie?: string,
): Promise<Partial<Record<Locale, string | null>>> {
  const alternates: Partial<Record<Locale, string | null>> = {};
  const language = stegaClean(article.language ?? '');
  const primaryDomain = stegaClean(article.primaryDomain ?? '');
  if (
    language &&
    isLocale(language) &&
    article.slug &&
    (primaryDomain === 'pet' || primaryDomain === 'farm' || primaryDomain === 'shared')
  ) {
    alternates[language] = articleRoute({
      language,
      primaryDomain: primaryDomain as ArticleDomain,
      slug: article.slug,
    });
  }
  const translationGroupId = stegaClean(article.translationGroupId ?? '');
  if (!translationGroupId) return alternates;

  const candidates = await fetchSanity<ARTICLE_ALTERNATES_QUERY_RESULT>(
    ARTICLE_ALTERNATES_QUERY,
    { translationGroupId },
    perspectiveCookie,
  );
  for (const candidate of candidates) {
    if (
      !candidate.language ||
      !isLocale(stegaClean(candidate.language ?? '')) ||
      !candidate.slug ||
      !isCurrent(candidate) ||
      stegaClean(candidate.primaryDomain ?? '') !== primaryDomain
    )
      continue;
    const candidateLanguage = stegaClean(candidate.language ?? '');
    const candidateDomain = stegaClean(candidate.primaryDomain ?? '');
    alternates[candidateLanguage] = articleRoute({
      language: candidateLanguage,
      primaryDomain: candidateDomain as ArticleDomain,
      slug: candidate.slug,
    });
  }
  return alternates;
}
