import { stegaClean } from '@sanity/client/stega';

export type ArticleDomain = 'pet' | 'farm' | 'shared';
export type ArticleRouteInput = { language: string; primaryDomain: ArticleDomain; slug: string };

export function articleRoute(article: ArticleRouteInput): string {
  const sections: Record<ArticleDomain, string> = {
    pet: 'pets',
    farm: 'farm',
    shared: 'knowledge',
  };
  const section = sections[stegaClean(article.primaryDomain) as ArticleDomain];
  return `/${stegaClean(article.language)}/${section}/${stegaClean(article.slug)}/`;
}

export function previousSlugRoutes(
  article: ArticleRouteInput & { previousSlugs?: string[] },
): string[] {
  return (article.previousSlugs ?? [])
    .filter((slug) => slug !== article.slug)
    .map((slug) => articleRoute({ ...article, slug }));
}
