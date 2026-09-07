import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(fileURLToPath(new URL('../apps/web/dist', import.meta.url)));
const htmlFiles = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
await walk(dist);
if (!htmlFiles.length) throw new Error('No static HTML output found.');
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const canonicals = html.match(/<link rel="canonical"[^>]*>/g) ?? [];
  if (canonicals.length !== 1 || !/href="https?:\/\//.test(canonicals[0]))
    throw new Error(`Expected one absolute canonical in ${file}`);
  if (!html.includes('<meta name="robots"')) throw new Error(`Missing robots metadata in ${file}`);
  if (/SANITY_API_READ_TOKEN|Authorization: Bearer|api[_-]?token/i.test(html))
    throw new Error(`Potential secret leaked into ${file}`);
}
const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
if (!sitemapUrls.length) throw new Error('Empty sitemap.');
const expectedIndexable =
  process.env.SITE_INDEXABLE === 'true' && process.env.DEPLOYMENT_TARGET === 'production';
if (expectedIndexable) {
  if (robots.includes('Disallow: /'))
    throw new Error('Indexable production release must not disallow the whole site.');
} else if (!robots.includes('Disallow: /')) {
  throw new Error(
    'Non-production or explicitly non-indexable release must be blocked by robots.txt.',
  );
}
for (const url of sitemapUrls) {
  const page = await readFile(join(dist, url.pathname, 'index.html'), 'utf8');
  if (!page.includes(`href="${url.href}"`))
    throw new Error(`Sitemap target lacks self-canonical: ${url}`);
  if (process.env.SITE_URL && url.origin !== new URL(process.env.SITE_URL).origin)
    throw new Error(`Sitemap host differs from SITE_URL: ${url}`);
}
console.log(`Validated SEO metadata and runtime boundary across ${htmlFiles.length} HTML files.`);
