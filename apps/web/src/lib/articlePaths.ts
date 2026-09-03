import { articleRoute, type ArticleDomain } from './articleRoute';
import { publishedArticlePathsQuery } from './queries';
import { sanityClient } from './sanity';
import type { Article } from '../../../studio/sanity.types';

type ArticlePath = Pick<Article, 'language' | 'primaryDomain'> & { slug?: string };

export async function getRussianArticlePaths() {
  const articles = await sanityClient.fetch<ArticlePath[]>(publishedArticlePathsQuery);
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
