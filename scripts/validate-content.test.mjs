import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRoutableContentIdentity } from './validate-content.mjs';

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
