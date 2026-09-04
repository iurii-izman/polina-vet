import type { APIRoute } from 'astro';
import { siteIndexable, siteUrl } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? siteUrl).toString().replace(/\/$/, '');
  const body = siteIndexable
    ? `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
