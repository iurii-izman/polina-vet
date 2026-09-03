import type { APIRoute } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { previewSessionCookieName } from '../../../lib/sanity/draft-mode';

export const prerender = import.meta.env.MODE !== 'preview';
export const GET: APIRoute = async () => {
  if (import.meta.env.MODE !== 'preview')
    return new Response('Preview is disabled in the static public build.', { status: 404 });
  const expired = [`${perspectiveCookieName}=`, 'Path=/', 'Secure', 'SameSite=None', 'Max-Age=0'];
  const expiredSession = [
    `${previewSessionCookieName}=`,
    'Path=/',
    'Secure',
    'SameSite=None',
    'Max-Age=0',
  ];
  const headers = new Headers();
  headers.append('Set-Cookie', expired.join('; '));
  headers.append('Set-Cookie', [...expired, 'Partitioned'].join('; '));
  headers.append('Set-Cookie', [...expiredSession, 'HttpOnly'].join('; '));
  headers.append('Set-Cookie', [...expiredSession, 'HttpOnly', 'Partitioned'].join('; '));
  headers.set('Location', '/');
  return new Response(null, { status: 307, headers });
};
