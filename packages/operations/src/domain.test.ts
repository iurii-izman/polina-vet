import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, validateOfficeInquiry, validatePublicInquiry } from './domain.ts';

const valid = {
  locale: 'ru',
  domain: 'PET',
  preferredContactChannel: 'phone',
  personName: 'Тестовое обращение',
  contactValue: '+37360000000',
  locality: 'Вымышленный район',
  species: 'dog',
  reason: 'sick',
  summary: 'Синтетическое описание для теста.',
  privacyNoticeVersion: 'draft-1',
  privacyAcknowledged: true,
};

test('public validation accepts a short pet inquiry and normalizes phone', () => {
  const result = validatePublicInquiry(valid, 'draft-1');
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.contactValue, '+37360000000');
});

test('public validation rejects unknown fields and invalid enums', () => {
  const result = validatePublicInquiry({ ...valid, status: 'CLOSED', domain: 'SHARED' }, 'draft-1');
  assert.equal(result.ok, false);
  if (!result.ok)
    assert.deepEqual(result.issues.map((issue) => issue.field).sort(), ['domain', 'status']);
});

test('farm validation requires group scope', () => {
  const result = validatePublicInquiry({ ...valid, domain: 'FARM', species: 'cattle' }, 'draft-1');
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.issues.some((issue) => issue.field === 'groupScope'));
});

test('closed inquiries can be reopened only into an active state', () => {
  assert.equal(canTransition('CLOSED', 'IN_PROGRESS'), true);
  assert.equal(canTransition('CLOSED', 'NEW'), false);
});

test('office validation supports synthetic phone quick add', () => {
  const result = validateOfficeInquiry({ ...valid, source: 'phone', contactChannel: 'phone' });
  assert.equal(result.ok, true);
});
