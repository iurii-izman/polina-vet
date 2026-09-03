import { articleRoute, type ArticleDomain } from './articleRoute';
import { ARTICLE_PATHS_QUERY } from './sanity/queries';
import { fetchSanity } from './sanity/load-query';
import type { ARTICLE_PATHS_QUERY_RESULT } from './sanity/sanity.types';

type ArticlePath = ARTICLE_PATHS_QUERY_RESULT[number];

export async function getArticlePaths(language?: string) {
  const articles = await fetchSanity<ARTICLE_PATHS_QUERY_RESULT>(ARTICLE_PATHS_QUERY);
  return articles
    .filter(
      (
        article,
      ): article is ArticlePath & {
        slug: string;
        primaryDomain: ArticleDomain;
        language: string;
      } =>
        Boolean(
          article.slug &&
          article.primaryDomain &&
          article.language &&
          (!language || article.language === language),
        ),
    )
    .map(
      (
        article: ArticlePath & { slug: string; primaryDomain: ArticleDomain; language: string },
      ) => ({
        params: { slug: article.slug },
        props: { domain: article.primaryDomain, language: article.language },
      }),
    );
}

export const getRussianArticlePaths = () => getArticlePaths('ru');

export function routeForPath(domain: ArticleDomain, slug: string) {
  return articleRoute({ language: 'ru', primaryDomain: domain, slug });
}
