/** Static routes that cannot be shadowed by an article in the same product domain. */
export const RESERVED_ARTICLE_ROUTES = new Set([
  'pet:urgent',
  'pet:before-visit',
  'farm:urgent',
  'farm:before-vet-arrives',
  'farm:group-problem',
]);

export function reservedArticleRouteKey(article) {
  return `${article.primaryDomain}:${article.slug}`;
}
