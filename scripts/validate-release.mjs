import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const configs = [
  ['apps/web/wrangler.jsonc', 'polina-vet-staging', 'polina-vet-dev.aipipeline.cc'],
  ['apps/web/wrangler.preview.jsonc', 'polina-vet-preview', 'preview-polina-vet.aipipeline.cc'],
  ['apps/web/wrangler.production.jsonc', 'polina-vet-production', 'lina.aipipeline.cc'],
  ['apps/studio/wrangler.jsonc', 'polina-vet-studio', 'studio-polina-vet.aipipeline.cc'],
  ['apps/intake/wrangler.jsonc', 'polina-vet-intake', 'intake-polina-vet.aipipeline.cc'],
  ['apps/office/wrangler.jsonc', 'polina-vet-office', 'office-polina-vet.aipipeline.cc'],
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
  if (
    json.routes?.length !== 1 ||
    json.routes[0].pattern !== hostname ||
    json.routes[0].custom_domain !== true
  )
    throw new Error(`Expected exactly one isolated custom hostname: ${file}`);
  if (
    name === 'polina-vet-production' &&
    (json.main ||
      json.vars ||
      json.bindings ||
      json.assets?.directory !== './dist' ||
      json.assets?.html_handling !== 'force-trailing-slash')
  )
    throw new Error(
      'Production must remain a static-assets-only Worker without runtime variables.',
    );
}
for (const file of ['apps/intake/wrangler.jsonc', 'apps/office/wrangler.jsonc']) {
  const text = await readFile(resolve(root, file), 'utf8');
  if (
    /OFFICE_AUTH_BYPASS\s*"?\s*:\s*"?true/i.test(text) ||
    /PUBLIC_INTAKE_ENABLED\s*"?\s*:\s*"?true/i.test(text)
  )
    throw new Error(`Activation gate must remain fail-closed in ${file}`);
}
console.log(`Validated ${configs.length} isolated Cloudflare Worker configurations.`);
