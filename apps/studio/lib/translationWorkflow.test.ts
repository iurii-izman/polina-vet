import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveTranslationReview, reviewedSourceRevision } from './translationWorkflow.ts';

const source = { _id: 'article-source', language: 'ru', medicalRevision: 7 };

describe('translation review workflow', () => {
  it('confirms a non-RU translation against the current RU revision', () => {
    assert.deepEqual(
      resolveTranslationReview({
        document: {
          language: 'ro',
          translatedFrom: { _type: 'reference', _ref: 'article-source' },
        },
        source,
      }),
      { sourceId: 'article-source', sourceMedicalRevision: 7 },
    );
  });

  it('allows a draft with no prior sourceMedicalRevision', () => {
    assert.equal(
      resolveTranslationReview({
        document: {
          language: 'uk',
          translatedFrom: { _ref: 'article-source' },
          sourceMedicalRevision: undefined,
        },
        source,
      }).sourceMedicalRevision,
      7,
    );
  });

  it('refuses RU, missing lineage, non-RU source, and invalid revision', () => {
    assert.throws(
      () =>
        resolveTranslationReview({
          document: { language: 'ru' },
          source,
        }),
      /RU sources/,
    );
    assert.throws(
      () => resolveTranslationReview({ document: { language: 'ro' }, source }),
      /translatedFrom RU source/,
    );
    assert.throws(
      () =>
        resolveTranslationReview({
          document: { language: 'ro', translatedFrom: { _ref: 'article-source' } },
          source: { ...source, language: 'uk' },
        }),
      /must be the RU source/,
    );
    assert.throws(
      () => reviewedSourceRevision({ language: 'ro', currentSourceRevision: 0 }),
      /valid current source medicalRevision/,
    );
  });
});
