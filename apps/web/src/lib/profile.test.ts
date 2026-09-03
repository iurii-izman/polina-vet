import assert from 'node:assert/strict';
import test from 'node:test';

import { safeMapHref, safePhoneHref, safeTelegramHref } from './profile.ts';

test('builds safe public contact links from approved values', () => {
  assert.equal(safePhoneHref('+373 777 40970'), 'tel:+37377740970');
  assert.equal(safeTelegramHref('@Polly_My'), 'https://t.me/Polly_My');
  assert.equal(
    safeMapHref('https://maps.app.goo.gl/EKB2oUzbYDr4q2pN9'),
    'https://maps.app.goo.gl/EKB2oUzbYDr4q2pN9',
  );
});

test('does not create links for malformed contact values', () => {
  assert.equal(safePhoneHref('call me'), undefined);
  assert.equal(safeTelegramHref('not a handle'), undefined);
  assert.equal(safeMapHref('javascript:alert(1)'), undefined);
});
