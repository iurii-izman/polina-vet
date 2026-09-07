import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../public/_headers', import.meta.url);
const destination = new URL('../dist/_headers', import.meta.url);
const defaultHeaders = await readFile(source, 'utf8');
const indexableProduction =
  process.env.SITE_INDEXABLE === 'true' && process.env.DEPLOYMENT_TARGET === 'production';

const headers = indexableProduction
  ? defaultHeaders.replace(/^\s*X-Robots-Tag:.*\r?\n/gm, '')
  : defaultHeaders;

await writeFile(destination, headers);
console.log(
  `Prepared Cloudflare headers for ${indexableProduction ? 'indexable production' : 'non-indexable'} output.`,
);
