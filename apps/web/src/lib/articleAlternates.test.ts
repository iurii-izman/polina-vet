import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveArticleAlternates } from './articleAlternateResolution.ts';

const source = {
  language: 'ru' as const,
  primaryDomain: 'pet' as const,
  slug: 'source-article',
  translationGroupId: 'group-1',
  medicalOwner: { _ref: 'author-1' },
  riskLevel: 'STANDARD' as const,
  lastMedicalReview: '2026-01-01',
  reviewIntervalMonths: 12,
  sources: [{ status: 'current' }],
};

const candidate = (overrides = {}) => ({
  slug: 'tradus-article',
  language: 'ro' as const,
  primaryDomain: 'pet' as const,
  translationGroupId: 'group-1',
  translatedFromId: 'source-article',
  translatedFromLanguage: 'ru' as const,
  sourceMedicalRevision: 1,
  sourceCurrentMedicalRevision: 1,
  archived: false,
  withdrawn: false,
  riskLevel: 'STANDARD' as const,
  medicalOwner: { _ref: 'author-1' },
  lastMedicalReview: '2026-01-01',
  reviewIntervalMonths: 12,
  sourceStatuses: ['current'],
  ...overrides,
});

describe('article alternates', () => {
  it('includes current RU and current RO alternates', () => {
    assert.deepEqual(resolveArticleAlternates(source, [candidate()], '2026-09-04'), {
      ru: '/ru/pets/source-article/',
      ro: '/ro/pets/tradus-article/',
    });
  });

  it('filters stale, archived, withdrawn, unsafe, and invalid-source candidates', () => {
    const result = resolveArticleAlternates(
      source,
      [
        candidate({ sourceMedicalRevision: 0 }),
        candidate({ archived: true }),
        candidate({ withdrawn: true }),
        candidate({ riskLevel: 'HIGH', reviewedBy: undefined }),
        candidate({
          riskLevel: 'HIGH',
          reviewedBy: { _ref: 'reviewer-1' },
          sourceStatuses: ['withdrawn'],
        }),
      ],
      '2026-09-04',
    );
    assert.deepEqual(result, { ru: '/ru/pets/source-article/' });
  });

  it('does not advertise an ineligible current article', () => {
    assert.deepEqual(
      resolveArticleAlternates(
        {
          ...source,
          riskLevel: 'HIGH',
          reviewedBy: { _ref: 'reviewer-1' },
          sources: [{ status: 'withdrawn' }],
        },
        [candidate()],
        '2026-09-04',
      ),
      {},
    );
  });

  it('does not advertise a stale translated page as its own alternate', () => {
    assert.deepEqual(
      resolveArticleAlternates(
        {
          ...source,
          language: 'ro',
          slug: 'tradus-article',
          translatedFrom: { _id: 'source-article', language: 'ru', medicalRevision: 2 },
          sourceMedicalRevision: 1,
          sources: [{ status: 'current' }],
        },
        [candidate()],
        '2026-09-04',
      ),
      {},
    );
  });
});
