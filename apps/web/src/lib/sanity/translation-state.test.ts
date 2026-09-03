import assert from 'node:assert/strict';
import test from 'node:test';

import { getSafeReplacement, getTranslationState } from './translation-state.ts';

test('derives current, missing, review-required, and withdrawn translation states', () => {
  assert.equal(getTranslationState({ exists: false }), 'MISSING');
  assert.equal(
    getTranslationState({ exists: true, medicalRevision: 3, sourceMedicalRevision: 3 }),
    'CURRENT',
  );
  assert.equal(
    getTranslationState({ exists: true, medicalRevision: 3, sourceMedicalRevision: 2 }),
    'REVIEW_REQUIRED',
  );
  assert.equal(getTranslationState({ exists: true, withdrawn: true }), 'WITHDRAWN');
});

test('keeps a withdrawn document on a safe replacement route', () => {
  assert.equal(
    getSafeReplacement({ withdrawn: true, replacement: '/ru/pets/urgent/' }),
    '/ru/pets/urgent/',
  );
  assert.equal(getSafeReplacement({ withdrawn: true }), null);
});
