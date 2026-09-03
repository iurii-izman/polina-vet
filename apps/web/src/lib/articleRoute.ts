export type ArticleDomain = 'pet' | 'farm' | 'shared';
export type ArticleRouteInput = { language: string; primaryDomain: ArticleDomain; slug: string };

export function articleRoute(article: ArticleRouteInput): string {
  const section =
    article.primaryDomain === 'pet'
      ? 'pets'
      : article.primaryDomain === 'farm'
        ? 'farm'
        : 'knowledge';
  return `/${article.language}/${section}/${article.slug}/`;
}

export function previousSlugRoutes(
  article: ArticleRouteInput & { previousSlugs?: string[] },
): string[] {
  return (article.previousSlugs ?? [])
    .filter((slug) => slug !== article.slug)
    .map((slug) => articleRoute({ ...article, slug }));
}
