import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createPublicReference } from './ids.ts';
import { notifyNewInquiry } from './notifications.ts';

test('D1 migration remains inquiry-centred and privacy constrained', async () => {
  const migration = await readFile(
    fileURLToPath(
      new URL('../../../apps/intake/migrations/0001_init/migration.sql', import.meta.url),
    ),
    'utf8',
  );
  assert.match(migration, /CREATE TABLE IF NOT EXISTS inquiries/);
  assert.match(migration, /idempotency_key TEXT NOT NULL UNIQUE/);
  assert.match(migration, /ON DELETE CASCADE/);
  assert.doesNotMatch(migration, /CREATE TABLE IF NOT EXISTS (clients|animals|farms|visits)/);
});

test('public references have the non-sequential PV shape', () => {
  const first = createPublicReference();
  const second = createPublicReference();
  assert.match(first, /^PV-[A-Z2-9]{8}$/);
  assert.notEqual(first, second);
});

test('Telegram adapter excludes inquiry PII', async () => {
  const originalFetch = globalThis.fetch;
  let payload = '';
  globalThis.fetch = async (_input, init) => {
    payload = String(init?.body ?? '');
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    const result = await notifyNewInquiry(
      {
        public_ref: 'PV-TEST123',
        domain: 'PET',
        locality: 'Вымышленный район',
        person_name: 'Синтетическое имя',
        contact_value: '+37360000000',
        summary: 'Синтетическое описание',
      } as never,
      { token: 'test-token', chatId: 'test-chat', officeUrl: 'https://office.example' },
    );
    assert.equal(result.delivered, true);
    assert.match(payload, /PV-TEST123/);
    assert.doesNotMatch(payload, /Синтетическое имя|37360000000|Синтетическое описание/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
