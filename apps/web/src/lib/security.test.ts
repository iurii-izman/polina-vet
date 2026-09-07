import test from 'node:test';
import assert from 'node:assert/strict';
import { safeJsonLd } from './safeJsonLd.ts';
import { safePortableTextHref } from './safePortableTextHref.ts';

test('JSON-LD serialization preserves JSON while neutralizing script delimiters', () => {
  const value = '</script><script>alert(1)</script> & >\u2028\u2029';
  const serialized = safeJsonLd({ value });

  assert.doesNotMatch(serialized, /<|>|&|\u2028|\u2029/);
  assert.doesNotMatch(serialized, /<\/script/i);
  assert.deepEqual(JSON.parse(serialized), { value });
});

test('Portable Text links allow only internal paths, fragments, and HTTPS', () => {
  const cases: Array<[string, string | null]> = [
    ['javascript:alert(1)', null],
    ['JaVaScRiPt:alert(1)', null],
    ['data:text/html,<script>alert(1)</script>', null],
    ['vbscript:msgbox(1)', null],
    ['file:///etc/passwd', null],
    ['blob:https://example.com/id', null],
    ['http://example.com', null],
    ['https://example.com/article', 'https://example.com/article'],
    ['/internal/path', '/internal/path'],
    ['#fragment', '#fragment'],
    ['//external.example/path', null],
  ];
  for (const [input, expected] of cases) assert.equal(safePortableTextHref(input), expected, input);
});
