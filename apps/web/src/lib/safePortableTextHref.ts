/** Return only the URL forms allowed for generic editorial Portable Text links. */
export function safePortableTextHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (!href || href !== value) return null;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (href.startsWith('#')) return href;
  if (!/^https:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && url.hostname ? href : null;
  } catch {
    return null;
  }
}
