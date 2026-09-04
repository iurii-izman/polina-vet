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
if (!robots.includes('Disallow: /'))
  throw new Error('Static release must be non-indexable by default.');
await readFile(join(dist, 'sitemap.xml'), 'utf8');
console.log(`Validated SEO metadata and runtime boundary across ${htmlFiles.length} HTML files.`);
