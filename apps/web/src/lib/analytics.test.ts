import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProperties } from './analytics.ts';

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
