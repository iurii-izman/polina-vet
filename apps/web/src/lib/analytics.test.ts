import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProperties } from './analytics.ts';
import { normalizeChannels } from './profile.ts';

test('analytics properties are explicitly allowlisted', () => {
  assert.deepEqual(
    sanitizeProperties('contact_click', {
      channel: 'telegram',
      phone: '+373',
      complaint: 'private',
    }),
    { channel: 'telegram' },
  );
});

test('unknown and oversized values are dropped', () => {
  assert.deepEqual(
    sanitizeProperties('domain_select', { domain: 'pet', unknown: 'x', locale: 'r'.repeat(81) }),
    { domain: 'pet' },
  );
});

test('normalizes configured channels while preserving verified contacts and priority', () => {
  assert.deepEqual(
    normalizeChannels(
      [
        { type: 'instagram', url: 'https://instagram.com/polina', enabled: true, priority: 4 },
        { type: 'viber', url: 'viber://chat?number=+37369000000', enabled: true, priority: 2 },
        { type: 'facebook', url: '#', enabled: true, priority: 5 },
      ],
      { primaryPhone: '+373 69 000 000', telegramHandle: '@polina_vet' },
    ).map(({ type, value }) => ({ type, value })),
    [
      { type: 'telegram', value: 'https://t.me/polina_vet' },
      { type: 'viber', value: 'viber://chat?number=+37369000000' },
      { type: 'phone', value: 'tel:+37369000000' },
      { type: 'instagram', value: 'https://instagram.com/polina' },
    ],
  );
});
