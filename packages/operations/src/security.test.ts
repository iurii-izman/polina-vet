import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedOrigin,
  officeMutationOriginAllowed,
  parseAllowedOrigins,
  privateHeaders,
  normalizeAccessIdentities,
  safeLog,
  verifyAccessJwt,
} from './security.ts';

const base64url = (value: Uint8Array | string) =>
  Buffer.from(typeof value === 'string' ? value : value).toString('base64url');

async function signedAccessToken(
  privateKey: CryptoKey,
  payload: Record<string, unknown>,
): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: 'test-key' }));
  const body = base64url(JSON.stringify(payload));
  const input = `${header}.${body}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(input)),
  );
  return `${input}.${base64url(signature)}`;
}

test('Access identity allowlists normalize and never treat empty as allow-all', () => {
  assert.deepEqual(normalizeAccessIdentities([' Vet@Example.com ', 'vet@example.com', '']), [
    'vet@example.com',
  ]);
  assert.deepEqual(normalizeAccessIdentities(undefined), []);
});

test('Access JWT verification requires a non-empty normalized identity allowlist', async () => {
  const keys = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ keys: [{ ...publicJwk, kid: 'test-key' }] }), { status: 200 });
  const base = {
    iss: 'https://team.example.cloudflareaccess.com',
    aud: 'audience',
    email: ' Vet@Example.com ',
    exp: Math.floor(Date.now() / 1000) + 300,
  };
  const requestFor = async (payload: Record<string, unknown>) =>
    new Request('https://office.example', {
      headers: { 'Cf-Access-Jwt-Assertion': await signedAccessToken(keys.privateKey, payload) },
    });
  const config = {
    teamDomain: base.iss,
    audience: 'audience',
  };
  try {
    assert.deepEqual(
      await verifyAccessJwt(await requestFor(base), { ...config, identities: ['vet@example.com'] }),
      { actor: 'vet@example.com', role: 'TECH_ADMIN' },
    );
    for (const identities of [['other@example.com'], [], undefined, ['   ']])
      assert.equal(await verifyAccessJwt(await requestFor(base), { ...config, identities }), null);
    assert.equal(
      await verifyAccessJwt(await requestFor({ ...base, exp: Math.floor(Date.now() / 1000) - 1 }), {
        ...config,
        identities: ['vet@example.com'],
      }),
      null,
    );
    assert.equal(
      await verifyAccessJwt(await requestFor({ ...base, aud: 'wrong' }), {
        ...config,
        identities: ['vet@example.com'],
      }),
      null,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

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
