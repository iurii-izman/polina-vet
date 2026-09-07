import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedOrigin,
  officeMutationOriginAllowed,
  parseAllowedOrigins,
  privateHeaders,
  safeLog,
} from './security.ts';

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

test('office mutation origin is exact and leaves non-mutations alone', () => {
  assert.equal(
    officeMutationOriginAllowed(
      new Request('https://office.example/api/animals', {
        method: 'POST',
        headers: { Origin: 'https://office.example' },
      }),
      'https://office.example',
    ),
    true,
  );
  assert.equal(
    officeMutationOriginAllowed(
      new Request('https://office.example/api/animals', {
        method: 'POST',
        headers: { Origin: 'https://evil.example' },
      }),
      'https://office.example',
    ),
    false,
  );
  assert.equal(
    officeMutationOriginAllowed(
      new Request('https://office.example/api/animals', { method: 'POST' }),
      'https://office.example',
    ),
    false,
  );
});

test('safe logs exclude PII-shaped fields', () => {
  assert.deepEqual(
    safeLog({
      operation: 'create',
      public_ref: 'PV-TEST',
      person_name: 'synthetic',
      contact: 'dummy',
      error_category: 'conflict',
    }),
    { operation: 'create', error_code: 'CONFLICT' },
  );
});

test('safe logs omit error code for successful events without an error', () => {
  assert.deepEqual(safeLog({ operation: 'request', result: 'SUCCESS', error_code: undefined }), {
    operation: 'request',
    result: 'SUCCESS',
  });
});
