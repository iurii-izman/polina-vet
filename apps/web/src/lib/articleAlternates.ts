import { fetchSanity } from './sanity/load-query';
import { ARTICLE_ALTERNATES_QUERY } from './sanity/queries';
import type { ARTICLE_ALTERNATES_QUERY_RESULT } from './sanity/sanity.types';
import { stegaClean } from '@sanity/client/stega';
import { resolveArticleAlternates, type ArticleForAlternates } from './articleAlternateResolution';

export { resolveArticleAlternates } from './articleAlternateResolution';
export type { ArticleForAlternates } from './articleAlternateResolution';

export async function getArticleAlternates(
  article: ArticleForAlternates,
  perspectiveCookie?: string,
): Promise<Partial<Record<'ru' | 'ro' | 'uk', string | null>>> {
  const translationGroupId = stegaClean(article.translationGroupId ?? '');
  const candidates = translationGroupId
    ? await fetchSanity<ARTICLE_ALTERNATES_QUERY_RESULT>(
        ARTICLE_ALTERNATES_QUERY,
        { translationGroupId },
        perspectiveCookie,
      )
    : [];
  return resolveArticleAlternates(article, candidates, new Date().toISOString().slice(0, 10));
}
