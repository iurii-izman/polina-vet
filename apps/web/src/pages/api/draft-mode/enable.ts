import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { sanityClient } from 'sanity:client';
import { getPreviewSessionValue, previewSessionCookieName } from '../../../lib/sanity/draft-mode';

export const prerender = import.meta.env.MODE !== 'preview';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (import.meta.env.MODE !== 'preview')
    return new Response('Preview is disabled in the static public build.', { status: 404 });
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) return new Response('PREVIEW_RUNTIME_TOKEN_REQUIRED', { status: 503 });
  const {
    isValid,
    redirectTo = '/',
    studioPreviewPerspective,
  } = await validatePreviewUrl(sanityClient.withConfig({ token }), request.url);
  if (!isValid) return new Response('Invalid preview secret', { status: 401 });
  const perspective = studioPreviewPerspective ?? 'drafts';
  const partitioned =
    request.headers.get('sec-fetch-dest') === 'iframe' &&
    request.headers.get('sec-fetch-site') === 'cross-site';
  cookies.set(perspectiveCookieName, perspective, {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    path: '/',
    partitioned,
  });
  cookies.set(previewSessionCookieName, await getPreviewSessionValue(token), {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    partitioned,
  });
  return redirect(redirectTo, 307);
};
