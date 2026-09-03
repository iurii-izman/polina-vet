import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectEditorialWarnings,
  validateContent,
  validateRoutableContentIdentity,
} from './validate-content.mjs';

const validArticle = (overrides = {}) => ({
  language: 'ru',
  slug: 'synthetic',
  primaryDomain: 'pet',
  title: 'Synthetic',
  summary: 'Synthetic',
  translationGroupId: 'synthetic',
  medicalOwner: 'author',
  riskLevel: 'STANDARD',
  medicalRevision: 1,
  lastMedicalReview: '2026-01-01',
  reviewIntervalMonths: 12,
  sources: ['source'],
  body: ['body'],
  ...overrides,
});

test('reports a duplicate published page route and translation identity', () => {
  const errors = validateRoutableContentIdentity({
    articles: [],
    pages: [
      {
        id: 'page.editorial-policy.ru',
        language: 'ru',
        slug: 'editorial-policy',
        translationGroupId: 'editorial-policy',
      },
      {
        id: 'page-editorial-policy-ru',
        language: 'ru',
        slug: 'editorial-policy',
        translationGroupId: 'editorial-policy',
      },
    ],
  });

  assert.deepEqual(errors, [
    'page-editorial-policy-ru: duplicate page route identity ru:editorial-policy (also page.editorial-policy.ru)',
    'page-editorial-policy-ru: duplicate page translation identity editorial-policy:ru (also page.editorial-policy.ru)',
  ]);
});

test('allows the same slug in separate pet and farm article identities', () => {
  assert.deepEqual(
    validateContent(
      [
        validArticle({ id: 'pet-same-slug', slug: 'same-slug', primaryDomain: 'pet' }),
        validArticle({ id: 'farm-same-slug', slug: 'same-slug', primaryDomain: 'farm' }),
      ],
      [{ id: 'source', status: 'current' }],
    ),
    [],
  );
});

test('rejects article routes reserved by static product routes', () => {
  const errors = validateContent(
    [validArticle({ id: 'article-pet-urgent', slug: 'urgent' })],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('reserved static route')));
});

test('withdrawn sources warn without blocking a safe rebuild', () => {
  const article = validArticle({
    id: 'article-withdrawn-source',
    slug: 'source-change',
    riskLevel: 'HIGH',
    reviewedBy: 'reviewer',
  });
  assert.deepEqual(validateContent([article], [{ id: 'source', status: 'withdrawn' }]), []);
  assert.equal(
    collectEditorialWarnings([article], [{ id: 'source', status: 'withdrawn' }]).length,
    1,
  );
});

test('replacement must be active and routable', () => {
  const errors = validateContent(
    [
      validArticle({
        id: 'withdrawn',
        slug: 'old',
        translationGroupId: 'old',
        withdrawn: true,
        replacement: 'replacement',
      }),
      validArticle({ id: 'replacement', slug: 'new', translationGroupId: 'new', archived: true }),
    ],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('active and routable')));
});
