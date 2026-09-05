import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export const draftSlug = 'pet-inappetence-lethargy';
export const draftTitle = 'Собака или кошка не ест и стала вялой: что оценить и когда нельзя ждать';
export const draftBody = 'Отказ от еды и вялость могут сопровождать разные состояния.';
export const articlePath = '/ru/pets/vomiting-diarrhea-what-to-observe/';

export function plainText(value) {
  return value
    .replace(/<[^<>]*>/g, ' ')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) =>
      String.fromCodePoint(
        code[0].toLowerCase() === 'x' ? Number.parseInt(code.slice(1), 16) : Number(code),
      ),
    )
    .replace(
      /&(?:nbsp|amp|quot|apos|lt|gt);/g,
      (entity) =>
        ({
          '&nbsp;': ' ',
          '&amp;': '&',
          '&quot;': '"',
          '&apos;': "'",
          '&lt;': '<',
          '&gt;': '>',
        })[entity],
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function assertNoDraft(body, path) {
  const text = plainText(body);
  for (const marker of [draftTitle, draftBody, draftSlug]) {
    assert(!text.includes(marker), `Draft exposed at ${path}`);
  }
}

const isWhitespace = (character) =>
  character === ' ' || character === '\t' || character === '\n' || character === '\r';
const isAttributeCharacter = (character) =>
  (character >= 'A' && character <= 'Z') ||
  (character >= 'a' && character <= 'z') ||
  (character >= '0' && character <= '9') ||
  character === '_' ||
  character === ':' ||
  character === '-';

function skipWhitespace(tag, index) {
  while (index < tag.length - 1 && isWhitespace(tag[index])) index += 1;
  return index;
}

function readAttributeName(tag, index) {
  const start = index;
  while (index < tag.length - 1 && isAttributeCharacter(tag[index])) index += 1;
  return { index, name: start === index ? null : tag.slice(start, index).toLowerCase() };
}

function readQuotedValue(tag, index) {
  const quote = tag[index];
  if (quote !== '"' && quote !== "'") return null;
  const start = index + 1;
  index = start;
  while (index < tag.length - 1 && tag[index] !== quote) index += 1;
  return { index: index + 1, value: tag.slice(start, index) };
}

function attributes(tag) {
  const result = {};
  let index = 1;
  while (index < tag.length - 1) {
    index = skipWhitespace(tag, index);
    const attribute = readAttributeName(tag, index);
    index = attribute.index;
    if (!attribute.name) {
      index += 1;
      continue;
    }
    index = skipWhitespace(tag, index);
    if (tag[index] !== '=') continue;
    const value = readQuotedValue(tag, skipWhitespace(tag, index + 1));
    if (!value) continue;
    result[attribute.name] = value.value;
    index = value.index;
  }
  return result;
}

export function inspectHtml(body, url, headers, indexable) {
  assert(/<main\b/i.test(body) && /<h1\b[^>]*>\s*\S/i.test(body), `Unusable page: ${url}`);
  assert(/<title>[^<]+<\/title>/i.test(body), `Missing title: ${url}`);
  assertNoDraft(body, url);
  assert(
    !/SANITY_API_READ_TOKEN|sanity-preview-perspective|data-sanity|visual-editing|Authorization: Bearer/i.test(
      body,
    ),
    `Preview/secret marker: ${url}`,
  );
  const links = [...body.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const metas = [...body.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const meta = (key) => metas.find((item) => item.name === key || item.property === key)?.content;
  const canonical = links.filter((link) => link.rel === 'canonical');
  assert.equal(canonical.length, 1, `Canonical count: ${url}`);
  assert.equal(canonical[0].href, url, `Wrong canonical: ${url}`);
  assert.equal(meta('og:url'), url, `Wrong OG origin: ${url}`);
  for (const key of ['description', 'og:title', 'og:description', 'robots'])
    assert(meta(key)?.trim(), `Missing ${key}: ${url}`);
  if (!indexable) {
    assert(/\bnoindex\b/.test(meta('robots')), `Indexable HTML: ${url}`);
    assert(/\bnoindex\b/.test(headers.get('x-robots-tag') ?? ''), `Missing HTTP noindex: ${url}`);
  }
  assert.equal(headers.get('x-content-type-options'), 'nosniff', `Missing nosniff: ${url}`);
  assert.equal(
    headers.get('referrer-policy'),
    'strict-origin-when-cross-origin',
    `Referrer policy: ${url}`,
  );
  const csp = headers.get('content-security-policy') ?? '';
  for (const directive of ["default-src 'self'", "frame-ancestors 'none'", "base-uri 'self'"])
    assert(csp.includes(directive), `Missing CSP ${directive}: ${url}`);
  assert(headers.get('permissions-policy'), `Missing permissions policy: ${url}`);
  assert(!/(?:src|srcset)=["']http:\/\//i.test(body), `Mixed content: ${url}`);
  const alternates = links.filter((link) => link.hreflang);
  for (const link of alternates)
    assert.equal(new URL(link.href).origin, new URL(url).origin, `Alternate host: ${url}`);
  const schemas = [
    ...body.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((match) => JSON.parse(match[1]));
  assert(
    schemas.some(
      (schema) => schema['@type'] === 'WebSite' && schema.url === `${new URL(url).origin}/`,
    ),
    `Missing site schema: ${url}`,
  );
  return { alternates, robots: meta('robots') };
}

export async function verifyOrigin({ origin, indexable, fetcher = fetch }) {
  const base = new URL(origin);
  assert(
    base.protocol === 'https:' &&
      base.pathname === '/' &&
      !base.search &&
      !base.hash &&
      !base.username &&
      !base.password,
    'VERIFY_ORIGIN must be a bare HTTPS origin',
  );
  const cache = new Map();
  async function get(path) {
    const url = new URL(path, base);
    assert.equal(url.origin, base.origin, 'Refusing cross-origin verification request');
    if (!cache.has(url.href)) {
      const response = await fetcher(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(30_000),
      });
      cache.set(url.href, { response, body: await response.text() });
    }
    return cache.get(url.href);
  }
  const root = await get('/');
  const httpRedirect =
    [301, 302, 307, 308].includes(root.response.status) &&
    new URL(root.response.headers.get('location'), base).href === `${base.origin}/ru/`;
  // Astro static output can use a meta refresh instead of an HTTP redirect.
  const staticRedirect =
    root.response.status === 200 &&
    /http-equiv="refresh"[^>]*content="[0-2];url=\/ru\/"/i.test(root.body);
  assert(httpRedirect || staticRedirect, 'Root must redirect to /ru/');
  const robots = await get('/robots.txt');
  assert.equal(robots.response.status, 200, 'robots.txt status');
  assert(/text\/plain/i.test(robots.response.headers.get('content-type')), 'robots.txt MIME');
  if (!indexable)
    assert(
      /^User-agent: \*\s+Disallow: \/\s*$/m.test(robots.body.trim()),
      'Non-indexable robots policy',
    );
  else assert(!/^Disallow: \/\s*$/m.test(robots.body), 'Indexable origin blocks crawling');
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.response.status, 200, 'Sitemap status');
  assert(sitemap.body.includes('<urlset'), 'Missing sitemap urlset');
  assertNoDraft(sitemap.body, '/sitemap.xml');
  const paths = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const url = new URL(match[1]);
    assert.equal(url.origin, base.origin, 'Sitemap host leak');
    assert(/^\/(ru|ro|uk)\//.test(url.pathname), 'Non-public sitemap route');
    return url.pathname;
  });
  assert(paths.length >= 40 && paths.includes(articlePath), 'Incomplete sitemap/public corpus');
  const families = [
    '',
    'pets/',
    'farm/',
    'knowledge/',
    'urgent/',
    'pets/urgent/',
    'farm/urgent/',
    'about/',
    'contact/',
  ];
  const routes = new Set([
    ...paths,
    ...['ru', 'ro', 'uk'].flatMap((locale) => families.map((path) => `/${locale}/${path}`)),
    articlePath,
  ]);
  const inspected = new Map();
  for (const path of routes) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200, `Public route status: ${path}`);
    assert(/text\/html/i.test(response.headers.get('content-type')), `HTML MIME: ${path}`);
    const result = inspectHtml(body, `${base.origin}${path}`, response.headers, indexable);
    if (indexable && paths.includes(path)) {
      assert(!/\bnoindex\b/.test(result.robots), `Sitemap route is noindex: ${path}`);
      assert(
        !/\bnoindex\b/.test(response.headers.get('x-robots-tag') ?? ''),
        `HTTP noindex: ${path}`,
      );
    }
    inspected.set(path, result);
  }
  for (const [path, result] of inspected) {
    for (const alternate of result.alternates) {
      const target = new URL(alternate.href).pathname;
      assert(inspected.has(target), `Alternate is not a verified public route: ${target}`);
      assert(
        inspected.get(target).alternates.some((link) => link.href === `${base.origin}${path}`),
        `Non-reciprocal alternate: ${path}`,
      );
    }
  }
  const medical = inspected.get(articlePath);
  assert(
    medical.alternates.every((link) => !['ro', 'uk'].includes(link.hreflang)),
    'Unpublished medical translation alternate',
  );
  for (const path of [`/ru/pets/${draftSlug}/`, '/ru/m11-not-a-real-page/']) {
    const { response, body } = await get(path);
    assert.equal(response.status, 404, `Expected safe 404: ${path}`);
    assertNoDraft(body, path);
    assert(
      /\bnoindex\b/.test(response.headers.get('x-robots-tag') ?? ''),
      `404 HTTP noindex: ${path}`,
    );
    assert(/<main\b/.test(body), `Unusable 404: ${path}`);
  }
  const summary = {
    origin: base.origin,
    indexable,
    routes: inspected.size,
    sitemapRoutes: paths.length,
    draftIsolation: 'PASS',
    root: httpRedirect ? 'HTTP redirect' : 'Astro static redirect',
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert(process.env.VERIFY_ORIGIN, 'VERIFY_ORIGIN is required');
  assert(
    ['true', 'false'].includes(process.env.EXPECT_INDEXABLE),
    'EXPECT_INDEXABLE must be true or false',
  );
  await verifyOrigin({
    origin: process.env.VERIFY_ORIGIN,
    indexable: process.env.EXPECT_INDEXABLE === 'true',
  });
}
