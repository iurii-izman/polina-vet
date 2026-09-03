import assert from 'node:assert/strict';
import test from 'node:test';

import { getArticlePresentation } from './articlePresentation.ts';
import { groupArticleBody } from './articleBodySegments.ts';
import { ARTICLE_DETAIL_QUERY, ARTICLE_PATHS_QUERY } from './sanity/queries.ts';
import { medicalBlockId } from './medicalBlockId.ts';

const baseArticle = {
  title: 'Synthetic article',
  summary: 'Old summary',
  seoDescription: 'Old SEO description',
  medicalOwner: { _id: 'author' },
  riskLevel: 'STANDARD' as const,
  medicalRevision: 1,
  lastMedicalReview: '2026-01-01',
  reviewIntervalMonths: 12,
  sources: [{ status: 'current' }],
};

test('detail identity includes language, primaryDomain, and slug', () => {
  assert.match(ARTICLE_DETAIL_QUERY, /language == \$language/);
  assert.match(ARTICLE_DETAIL_QUERY, /primaryDomain == \$primaryDomain/);
  assert.match(ARTICLE_DETAIL_QUERY, /slug\.current == \$slug/);
  assert.match(ARTICLE_PATHS_QUERY, /!archived/);
  assert.doesNotMatch(ARTICLE_PATHS_QUERY, /!withdrawn/);
});

test('mixed article body keeps authored order and adjacent Portable Text chunks', () => {
  const segments = groupArticleBody([
    { _type: 'block', _key: 'p1' },
    { _type: 'practicalActions', _key: 'actions' },
    { _type: 'block', _key: 'p2' },
    { _type: 'dontDoBlock', _key: 'dont' },
  ]);
  assert.deepEqual(
    segments.map((segment) => segment.type),
    ['portable', 'medical', 'portable', 'medical'],
  );
  assert.deepEqual(
    segments.map((segment) =>
      segment.type === 'medical' ? segment.block._key : segment.blocks[0]._key,
    ),
    ['p1', 'actions', 'p2', 'dont'],
  );
});

test('medical blocks receive unique heading IDs from stable keys', () => {
  assert.notEqual(
    medicalBlockId('practicalActions', 'first'),
    medicalBlockId('practicalActions', 'second'),
  );
  assert.equal(medicalBlockId('practicalActions', 'first'), 'medical-block-first');
});

test('current, stale-high-risk, and withdrawn presentation states protect summaries and SEO', () => {
  const current = getArticlePresentation(baseArticle, '2026-06-01');
  assert.equal(current.showMedicalContent, true);
  assert.equal(current.description, 'Old SEO description');
  assert.equal(current.robots, undefined);

  const stale = getArticlePresentation(
    {
      ...baseArticle,
      riskLevel: 'HIGH',
      reviewedBy: { _id: 'reviewer' },
      lastMedicalReview: '2020-01-01',
    },
    '2026-06-01',
  );
  assert.equal(stale.showMedicalContent, false);
  assert.notEqual(stale.description, baseArticle.summary);
  assert.equal(stale.robots, 'noindex,follow');

  const withdrawn = getArticlePresentation({ ...baseArticle, withdrawn: true }, '2026-06-01');
  assert.equal(withdrawn.showMedicalContent, false);
  assert.notEqual(withdrawn.description, baseArticle.summary);
  assert.equal(withdrawn.robots, 'noindex,follow');
});
