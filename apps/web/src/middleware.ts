import type { MiddlewareHandler } from 'astro';
import { getDraftModeProps } from './lib/sanity/draft-mode';

export const onRequest: MiddlewareHandler = async ({ cookies }, next) => {
  const response = await next();
  if (import.meta.env.MODE !== 'preview') return response;

  const { perspectiveCookie } = await getDraftModeProps(cookies);
  if (!perspectiveCookie) return response;

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
