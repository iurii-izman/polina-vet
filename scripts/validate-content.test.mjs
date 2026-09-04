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

test('HIGH-risk reviewer must be independent from medicalOwner', () => {
  const errors = validateContent(
    [validArticle({ id: 'high-same-reviewer', riskLevel: 'HIGH', reviewedBy: 'author' })],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('independent from medicalOwner')));
});

test('medicalRevision must be a positive integer', () => {
  for (const value of [undefined, 0, 1.5]) {
    const errors = validateContent(
      [validArticle({ id: `medical-revision-${String(value)}`, medicalRevision: value })],
      [{ id: 'source', status: 'current' }],
    );
    assert.ok(errors.some((error) => error.includes('publication contract is incomplete')));
  }
});

test('reviewIntervalMonths must be a positive integer', () => {
  for (const value of [undefined, 0]) {
    const errors = validateContent(
      [validArticle({ id: `review-interval-${String(value)}`, reviewIntervalMonths: value })],
      [{ id: 'source', status: 'current' }],
    );
    assert.ok(errors.some((error) => error.includes('publication contract is incomplete')));
  }
});

test('translation lineage requires a positive sourceMedicalRevision', () => {
  const source = validArticle({ id: 'translation-source', translationGroupId: 'translation' });
  const translation = validArticle({
    id: 'translation-ro',
    language: 'ro',
    slug: 'translation-ro',
    translationGroupId: 'translation',
    translatedFrom: 'translation-source',
    sourceMedicalRevision: undefined,
  });
  assert.ok(
    validateContent([source, translation], [{ id: 'source', status: 'current' }]).some((error) =>
      error.includes('translation lineage is incomplete'),
    ),
  );
});

test('translation lineage with sourceMedicalRevision 1 is valid', () => {
  const source = validArticle({
    id: 'translation-source-valid',
    translationGroupId: 'translation-valid',
  });
  const translation = validArticle({
    id: 'translation-ro-valid',
    language: 'ro',
    slug: 'translation-ro-valid',
    translationGroupId: 'translation-valid',
    translatedFrom: 'translation-source-valid',
    sourceMedicalRevision: 1,
  });
  assert.deepEqual(
    validateContent([source, translation], [{ id: 'source', status: 'current' }]),
    [],
  );
});

test('translation lineage rejects a stale source revision or non-RU source', () => {
  const source = validArticle({
    id: 'translation-source-stale',
    translationGroupId: 'translation-stale',
    medicalRevision: 2,
  });
  const translation = validArticle({
    id: 'translation-ro-stale',
    language: 'ro',
    slug: 'translation-ro-stale',
    translationGroupId: 'translation-stale',
    translatedFrom: { _ref: 'translation-source-stale' },
    sourceMedicalRevision: 1,
  });
  const errors = validateContent([source, translation], [{ id: 'source', status: 'current' }]);
  assert.ok(errors.some((error) => error.includes('sourceMedicalRevision does not match')));
});

test('RU source rejects sourceMedicalRevision 0 as present lineage', () => {
  const errors = validateContent(
    [validArticle({ id: 'ru-lineage-zero', sourceMedicalRevision: 0 })],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('RU source cannot have translation lineage')));
});

test('withdrawn replacement cannot be archived', () => {
  const errors = validateContent(
    [
      validArticle({
        id: 'withdrawn-a',
        slug: 'old',
        withdrawn: true,
        replacement: 'replacement-b',
      }),
      validArticle({ id: 'replacement-b', slug: 'new', archived: true }),
    ],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('active and routable')));
});

test('superseded source requires a different replacement', () => {
  const article = validArticle({ id: 'source-lifecycle', sources: ['superseded'] });
  assert.ok(
    validateContent(
      [article],
      [{ id: 'superseded', status: 'superseded', supersededBy: 'superseded' }],
    ).some((error) => error.includes('different supersededBy')),
  );
});

test('superseded source rejects a dangling replacement reference', () => {
  const article = validArticle({ id: 'source-dangling', sources: ['superseded'] });
  assert.ok(
    validateContent(
      [article],
      [{ id: 'superseded', status: 'superseded', supersededBy: 'missing-source' }],
    ).some((error) => error.includes('different supersededBy')),
  );
});

test('superseded source with an existing different replacement remains valid', () => {
  const article = validArticle({ id: 'source-valid-replacement', sources: ['superseded'] });
  assert.deepEqual(
    validateContent(
      [article],
      [
        { id: 'superseded', status: 'superseded', supersededBy: 'current-source' },
        { id: 'current-source', status: 'current' },
      ],
    ),
    [],
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
