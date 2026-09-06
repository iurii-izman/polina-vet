import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigin, parseAllowedOrigins, privateHeaders, safeLog } from './security.ts';

test('origin policy is exact and normalized', () => {
  assert.deepEqual(parseAllowedOrigins('https://a.example, https://b.example/path'), [
    'https://a.example',
    'https://b.example',
  ]);
  assert.equal(
    allowedOrigin(
      new Request('https://api.example', { headers: { Origin: 'https://a.example' } }),
      ['https://a.example'],
    ),
    'https://a.example',
  );
  assert.equal(
    allowedOrigin(
      new Request('https://api.example', { headers: { Origin: 'https://evil.example' } }),
      ['https://a.example'],
    ),
    null,
  );
});

test('private headers prevent caching and indexing', () => {
  const headers = privateHeaders();
  assert.equal(headers.get('Cache-Control'), 'no-store');
  assert.match(headers.get('X-Robots-Tag') ?? '', /noindex/);
});

test('safe logs exclude PII-shaped fields', () => {
  assert.deepEqual(
    safeLog({
      operation: 'create',
      public_ref: 'PV-TEST',
      person_name: 'synthetic',
      contact: 'dummy',
    }),
    { operation: 'create', public_ref: 'PV-TEST' },
  );
});
