import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { inquiryRetentionDeadline } from './retentionPolicy.ts';

test('every inquiry receives a 365-day absolute deadline', () => {
  assert.equal(inquiryRetentionDeadline('2026-01-01T00:00:00.000Z'), '2027-01-01T00:00:00.000Z');
});

test('closing an inquiry cannot extend its absolute creation deadline', () => {
  assert.equal(
    inquiryRetentionDeadline('2026-01-01T00:00:00.000Z', '2026-06-01T00:00:00.000Z'),
    '2027-01-01T00:00:00.000Z',
  );
});

test('retention query includes open and closed inquiries without touching clinical tables', async () => {
  const source = await readFile(fileURLToPath(new URL('./db.ts', import.meta.url)), 'utf8');
  assert.match(source, /COALESCE\(retention_until, datetime\(created_at, '\+365 days'\)\)/);
  assert.match(source, /DELETE FROM inquiries/);
  assert.doesNotMatch(source, /DELETE FROM (clients|animals|holdings|encounters|clinical_records)/);
});
