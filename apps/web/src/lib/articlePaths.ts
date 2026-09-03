import { articleRoute, type ArticleDomain } from './articleRoute';
import { ARTICLE_PATHS_QUERY } from './sanity/queries';
import { sanityClient } from 'sanity:client';
import type { ARTICLE_PATHS_QUERY_RESULT } from './sanity/sanity.types';

type ArticlePath = ARTICLE_PATHS_QUERY_RESULT[number];

export async function getRussianArticlePaths() {
  const articles = await sanityClient.fetch(ARTICLE_PATHS_QUERY);
  return articles
    .filter((article): article is ArticlePath & { slug: string; primaryDomain: ArticleDomain } =>
      Boolean(article.slug && article.primaryDomain),
    )
    .map((article) => ({
      params: { slug: article.slug },
      props: { domain: article.primaryDomain },
    }));
}

export function routeForPath(domain: ArticleDomain, slug: string) {
  return articleRoute({ language: 'ru', primaryDomain: domain, slug });
}
