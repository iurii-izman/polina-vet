import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const configs = [
  ['apps/web/wrangler.jsonc', 'polina-vet-staging', 'polina-vet-dev.aipipeline.cc'],
  ['apps/web/wrangler.preview.jsonc', 'polina-vet-preview', 'preview-polina-vet.aipipeline.cc'],
  ['apps/web/wrangler.production.jsonc', 'polina-vet-production', 'lina.md'],
  ['apps/studio/wrangler.jsonc', 'polina-vet-studio', 'studio-polina-vet.aipipeline.cc'],
];
for (const [file, name, hostname] of configs) {
  const text = await readFile(resolve(root, file), 'utf8');
  const lines = text.split('\n');
  const jsonText = lines
    .filter((line) => !line.trimStart().startsWith('//'))
    .map((line, index, remainingLines) => {
      const nextLine = remainingLines[index + 1]?.trimStart();
      const trailingComma = line.trimEnd().endsWith(',');
      const nextIsClosing = nextLine?.startsWith('}') || nextLine?.startsWith(']');

      if (!trailingComma || !nextIsClosing) return line;
      return line.trimEnd().slice(0, -1);
    })
    .join('\n');
  const json = JSON.parse(jsonText);
  if (json.name !== name || json.workers_dev !== false || json.preview_urls !== false) {
    throw new Error(`Invalid isolated Worker configuration: ${file}`);
  }
  if (!text.includes(hostname)) throw new Error(`Missing exact custom hostname: ${file}`);
}
console.log(`Validated ${configs.length} isolated Cloudflare Worker configurations.`);
