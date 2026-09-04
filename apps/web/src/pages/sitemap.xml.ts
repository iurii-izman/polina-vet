import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site';
import { requiredLocalizedCoreRoutes } from '../lib/routeContract';
import { getEligibleKnowledge } from '../lib/sanity/content';

export const GET: APIRoute = async () => {
  const routes = new Set(
    requiredLocalizedCoreRoutes.filter((path) => !path.endsWith('/knowledge/')),
  );
  for (const locale of ['ru', 'ro', 'uk']) {
    const articles = await getEligibleKnowledge(locale, new Date().toISOString().slice(0, 10));
    for (const article of articles) {
      const domain = article.primaryDomain === 'pet' ? 'pets' : 'farm';
      if (article.slug) routes.add(`/${locale}/${domain}/${article.slug}/`);
    }
  }
  const urls = [...routes].map((path) => `<url><loc>${absoluteUrl(path)}</loc></url>`).join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
};
