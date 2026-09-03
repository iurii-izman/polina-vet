import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRoutableContentIdentity } from './validate-content.mjs';
import { validateContent, collectEditorialWarnings } from './validate-content.mjs';

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
  const base = {
    language: 'ru',
    slug: 'same-slug',
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
  };
  assert.deepEqual(
    validateContent(
      [
        { ...base, id: 'pet-same-slug', primaryDomain: 'pet' },
        { ...base, id: 'farm-same-slug', primaryDomain: 'farm' },
      ],
      [{ id: 'source', status: 'current' }],
    ),
    [],
  );
});

test('rejects article routes reserved by static product routes', () => {
  const errors = validateContent(
    [
      {
        id: 'article-pet-urgent',
        language: 'ru',
        slug: 'urgent',
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
      },
    ],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('reserved static route')));
});

test('withdrawn sources warn without blocking a safe rebuild', () => {
  const article = {
    id: 'article-withdrawn-source',
    language: 'ru',
    slug: 'source-change',
    primaryDomain: 'pet',
    title: 'Synthetic',
    summary: 'Synthetic',
    translationGroupId: 'synthetic',
    medicalOwner: 'author',
    riskLevel: 'HIGH',
    reviewedBy: 'reviewer',
    medicalRevision: 1,
    lastMedicalReview: '2026-01-01',
    reviewIntervalMonths: 12,
    sources: ['source'],
    body: ['body'],
  };
  assert.deepEqual(validateContent([article], [{ id: 'source', status: 'withdrawn' }]), []);
  assert.equal(
    collectEditorialWarnings([article], [{ id: 'source', status: 'withdrawn' }]).length,
    1,
  );
});

test('replacement must be active and routable', () => {
  const errors = validateContent(
    [
      {
        id: 'withdrawn',
        language: 'ru',
        slug: 'old',
        primaryDomain: 'pet',
        title: 'Old',
        summary: 'Old',
        translationGroupId: 'old',
        medicalOwner: 'author',
        riskLevel: 'STANDARD',
        medicalRevision: 1,
        lastMedicalReview: '2026-01-01',
        reviewIntervalMonths: 12,
        sources: ['source'],
        body: ['body'],
        withdrawn: true,
        replacement: 'replacement',
      },
      {
        id: 'replacement',
        language: 'ru',
        slug: 'new',
        primaryDomain: 'pet',
        title: 'New',
        summary: 'New',
        translationGroupId: 'new',
        medicalOwner: 'author',
        riskLevel: 'STANDARD',
        medicalRevision: 1,
        lastMedicalReview: '2026-01-01',
        reviewIntervalMonths: 12,
        sources: ['source'],
        body: ['body'],
        archived: true,
      },
    ],
    [{ id: 'source', status: 'current' }],
  );
  assert.ok(errors.some((error) => error.includes('active and routable')));
});
