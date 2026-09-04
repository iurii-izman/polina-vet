import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const configs = [
  ['apps/web/wrangler.jsonc', 'polina-vet-staging', 'polina-vet-dev.aipipeline.cc'],
  ['apps/web/wrangler.preview.jsonc', 'polina-vet-preview', 'preview-polina-vet.aipipeline.cc'],
  ['apps/studio/wrangler.jsonc', 'polina-vet-studio', 'studio-polina-vet.aipipeline.cc'],
];
for (const [file, name, hostname] of configs) {
  const text = await readFile(resolve(root, file), 'utf8');
  const json = JSON.parse(text.replace(/\/\/.*$/gm, '').replace(/,([\r\n\t ]*[}\]])/g, '$1'));
  if (json.name !== name || json.workers_dev !== false || json.preview_urls !== false) {
    throw new Error(`Invalid isolated Worker configuration: ${file}`);
  }
  if (!text.includes(hostname)) throw new Error(`Missing exact custom hostname: ${file}`);
}
console.log(`Validated ${configs.length} isolated Cloudflare Worker configurations.`);
