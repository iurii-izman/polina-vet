import assert from 'node:assert/strict';
import test from 'node:test';

import { getSafeReplacement, getTranslationState } from './translation-state.ts';

test('derives current, missing, review-required, and withdrawn translation states', () => {
  assert.equal(getTranslationState({ exists: false }), 'PENDING');
  assert.equal(
    getTranslationState({
      exists: true,
      sourceCurrentMedicalRevision: 4,
      translationSourceMedicalRevision: 4,
    }),
    'CURRENT',
  );
  assert.equal(
    getTranslationState({
      exists: true,
      sourceCurrentMedicalRevision: 4,
      translationSourceMedicalRevision: 3,
    }),
    'REVIEW_REQUIRED',
  );
  assert.equal(getTranslationState({ exists: true, withdrawn: true }), 'WITHDRAWN');
  assert.equal(getTranslationState({ exists: true }), 'REVIEW_REQUIRED');
});

test('does not use the translation own medicalRevision to determine freshness', () => {
  assert.equal(
    getTranslationState({
      exists: true,
      sourceCurrentMedicalRevision: 4,
      translationSourceMedicalRevision: 4,
    }),
    'CURRENT',
  );
});

test('keeps a withdrawn document on a safe replacement route', () => {
  assert.equal(
    getSafeReplacement({ withdrawn: true, replacement: '/ru/pets/urgent/' }),
    '/ru/pets/urgent/',
  );
  assert.equal(getSafeReplacement({ withdrawn: true }), null);
});
