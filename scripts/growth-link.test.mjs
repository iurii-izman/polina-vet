import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('growth link encodes controlled UTM fields against SITE_URL', () => {
  const output = execFileSync(
    process.execPath,
    [
      'scripts/growth-link.mjs',
      '--destination',
      '/ru/pets/',
      '--source',
      'telegram',
      '--medium',
      'messenger',
      '--campaign',
      'prevention 2026',
      '--content',
      'bio/1',
    ],
    { env: { ...process.env, SITE_URL: 'https://example.test' }, encoding: 'utf8' },
  ).trim();
  assert.equal(
    output,
    'https://example.test/ru/pets/?utm_source=telegram&utm_medium=messenger&utm_campaign=prevention+2026&utm_content=bio%2F1',
  );
});
