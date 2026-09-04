import { access, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { constants } from 'node:fs';

const dist = resolve('dist');
const index = join(dist, 'index.html');
const staticDir = join(dist, 'static');

await access(index, constants.F_OK);
const staticEntries = await readdir(staticDir);

if (staticEntries.length === 0) {
  throw new Error('Studio build validation failed: dist/static is empty');
}

console.log(
  `Studio build validation passed: ${index} and ${staticEntries.length} static entries found`,
);
