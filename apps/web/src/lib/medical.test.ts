import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  deriveMedicalReviewState,
  derivePublicSafetyState,
  deriveSourceHealth,
  deriveTranslationState,
  addCalendarMonths,
  isDiscoveryEligible,
} from './medical.ts';
import { articleRoute, previousSlugRoutes } from './articleRoute.ts';

describe('medical governance helpers', () => {
  it('clamps calendar month addition to the target month', () => {
    assert.equal(
      addCalendarMonths(new Date('2026-01-31T00:00:00Z'), 1).toISOString().slice(0, 10),
      '2026-02-28',
    );
    assert.equal(
      addCalendarMonths(new Date('2024-01-31T00:00:00Z'), 1).toISOString().slice(0, 10),
      '2024-02-29',
    );
    assert.equal(
      addCalendarMonths(new Date('2026-01-15T00:00:00Z'), 1).toISOString().slice(0, 10),
      '2026-02-15',
    );
  });
  it('uses calendar dates for current and expired review', () => {
    assert.equal(
      deriveMedicalReviewState(
        { lastMedicalReview: '2026-01-15', reviewIntervalMonths: 3, riskLevel: 'HIGH' },
        '2026-04-14',
      ),
      'CURRENT',
    );
    assert.equal(
      deriveMedicalReviewState(
        { lastMedicalReview: '2026-01-15', reviewIntervalMonths: 3, riskLevel: 'HIGH' },
        '2026-04-15',
      ),
      'REVIEW_REQUIRED',
    );
  });
  it('derives source lifecycle health', () => {
    assert.equal(deriveSourceHealth([{ status: 'current' }]), 'current');
    assert.equal(deriveSourceHealth([{ status: 'superseded' }]), 'superseded');
    assert.equal(deriveSourceHealth([{ status: 'withdrawn' }]), 'withdrawn');
    assert.equal(deriveSourceHealth([undefined]), 'missing');
  });
  it('gates stale high-risk material', () => {
    assert.equal(
      derivePublicSafetyState({
        riskLevel: 'HIGH',
        reviewState: 'CURRENT',
        sourceHealth: 'current',
      }),
      'CURRENT',
    );
    assert.equal(
      isDiscoveryEligible(
        {
          riskLevel: 'HIGH',
          lastMedicalReview: '2020-01-01',
          reviewIntervalMonths: 3,
          sourceStatuses: ['current'],
        },
        '2026-09-03',
      ),
      false,
    );
    assert.equal(
      derivePublicSafetyState({
        riskLevel: 'HIGH',
        reviewState: 'REVIEW_REQUIRED',
        sourceHealth: 'current',
      }),
      'STALE_HIGH_RISK',
    );
    assert.equal(
      derivePublicSafetyState({
        riskLevel: 'STANDARD',
        reviewState: 'CURRENT',
        sourceHealth: 'withdrawn',
      }),
      'CURRENT',
    );
  });
  it('uses source revision for translation freshness', () => {
    assert.equal(
      deriveTranslationState({
        language: 'ro',
        translatedFromMedicalRevision: 3,
        sourceMedicalRevision: 3,
      }),
      'CURRENT',
    );
    assert.equal(
      deriveTranslationState({
        language: 'ro',
        translatedFromMedicalRevision: 2,
        sourceMedicalRevision: 3,
      }),
      'REVIEW_REQUIRED',
    );
    assert.equal(deriveTranslationState({ language: 'ro' }), 'REVIEW_REQUIRED');
    assert.equal(deriveTranslationState(undefined), 'PENDING');
  });
  it('maps canonical domains and previous slugs', () => {
    assert.equal(articleRoute({ language: 'ru', primaryDomain: 'pet', slug: 'a' }), '/ru/pets/a/');
    assert.equal(articleRoute({ language: 'ru', primaryDomain: 'farm', slug: 'a' }), '/ru/farm/a/');
    assert.equal(
      articleRoute({ language: 'ru', primaryDomain: 'shared', slug: 'a' }),
      '/ru/knowledge/a/',
    );
    assert.deepEqual(
      previousSlugRoutes({
        language: 'ru',
        primaryDomain: 'pet',
        slug: 'new',
        previousSlugs: ['old', 'new'],
      }),
      ['/ru/pets/old/'],
    );
  });
});
