import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertNoDraft,
  draftTitle,
  draftBody,
  inspectHtml,
  verifyOrigin,
} from './verify-origin.mjs';

test('draft title, body-only leaks and encoded title are rejected', () => {
  for (const body of [
    draftTitle,
    draftBody,
    [...draftTitle].map((letter) => `&#${letter.codePointAt(0)};`).join(''),
  ]) {
    assert.throws(() => assertNoDraft(body, '/draft/'), /Draft exposed/);
  }
  assert.doesNotThrow(() => assertNoDraft('<h1>Страница не найдена</h1>', '/draft/'));
});

const url = 'https://candidate.example/ru/';
const html = `<main><h1>Home</h1></main><title>Home</title>
<link rel="canonical" href="${url}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="Home"><meta property="og:description" content="Description">
<meta name="description" content="Description"><meta name="robots" content="noindex">
<script type="application/ld+json">{"@type":"WebSite","url":"https://candidate.example/"}</script>`;
const headers = () =>
  new Headers({
    'x-robots-tag': 'noindex',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=()',
    'content-security-policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'self'",
  });

test('requires both HTML and HTTP noindex and the correct canonical', () => {
  assert.doesNotThrow(() => inspectHtml(html, url, headers(), false));
  const missing = headers();
  missing.delete('x-robots-tag');
  assert.throws(() => inspectHtml(html, url, missing, false), /HTTP noindex/);
  assert.throws(
    () => inspectHtml(html.replace('content="noindex"', 'content="index"'), url, headers(), false),
    /Indexable HTML/,
  );
  assert.throws(
    () =>
      inspectHtml(
        html.replace(`href="${url}"`, 'href="https://wrong.example/ru/"'),
        url,
        headers(),
        false,
      ),
    /Wrong canonical/,
  );
});

test('Access challenges and server failures cannot pass as root routing', async () => {
  for (const response of [
    new Response('Login', { status: 403 }),
    new Response('Failure', { status: 503 }),
    new Response('', { status: 302, headers: { location: 'https://access.example/login' } }),
  ]) {
    await assert.rejects(
      verifyOrigin({
        origin: 'https://candidate.example',
        indexable: false,
        fetcher: async () => response,
      }),
      /Root must redirect/,
    );
  }
});

test('origin credentials and non-HTTPS URLs are refused before any request', async () => {
  for (const origin of [
    'http://candidate.example',
    'https://user:password@candidate.example',
    'https://candidate.example/path',
  ]) {
    await assert.rejects(
      verifyOrigin({ origin, indexable: false, fetcher: () => assert.fail('Must not fetch') }),
      /bare HTTPS origin/,
    );
  }
});
