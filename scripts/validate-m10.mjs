import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matrix = readFileSync(new URL('../docs/M10_CONTENT_MATRIX.md', import.meta.url), 'utf8');
const seed = readFileSync(new URL('../apps/studio/scripts/seed-m10.ts', import.meta.url), 'utf8');
const requiredIds = [
  'article-pet-inappetence-lethargy',
  'article-pet-tick-found',
  'article-pet-wound-bite-trauma',
  'article-pet-suspected-poisoning',
  'article-cat-urinary-obstruction',
  'article-pet-eye-redness',
  'article-pet-ear-discharge',
  'article-pet-breathing-cough',
  'article-pet-itch-skin-changes',
  'article-home-veterinary-first-aid-kit',
  'article-safe-animal-transport',
  'article-farm-multiple-animals-sick',
  'article-farm-youngstock-diarrhea',
  'article-farm-mastitis-signs',
];
for (const id of requiredIds)
  assert.match(seed, new RegExp(`['"]${id}['"]`), `missing M10 article ${id}`);
assert.equal(requiredIds.length, 14);
assert.match(seed, /drafts\.\$\{item\.id\}/, 'M10 sources must be drafted');
assert.match(
  seed,
  /sourceMedicalRevision: undefined/,
  'translations must remain REVIEW_REQUIRED until review',
);
assert.match(seed, /20 км/, 'field-visit wording must be present');
assert.doesNotMatch(
  seed,
  /24\/7|08:00|17:00|checkout|booking|payment/i,
  'unsafe commercial or availability claims leaked into seed',
);
assert.match(matrix, /M10 content matrix/);
assert.match(matrix, /HIGH requiring independent review|independent review/i);
console.log(
  'M10 content policy validation passed: 14 new article families, draft-first translations, safety boundaries, and launch matrix present.',
);
