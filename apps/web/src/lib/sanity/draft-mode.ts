import type { AstroCookies } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';

export const previewSessionCookieName = 'polina-vet-preview-session';
const previewSessionMessage = 'polina-vet-preview-session-v1';

function toBase64Url(bytes: ArrayBuffer) {
  const binary = String.fromCodePoint(...new Uint8Array(bytes));
  const encoded = btoa(binary).replaceAll('+', '-').replaceAll('/', '_');
  return encoded.replaceAll('=', '');
}

async function signPreviewSession(token: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(token),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(previewSessionMessage)),
  );
}

export async function getPreviewSessionValue(token: string) {
  return signPreviewSession(token);
}

export async function getDraftModeProps(cookies: AstroCookies) {
  if (import.meta.env.MODE !== 'preview') return { perspectiveCookie: undefined };
  const perspectiveCookie = cookies.get(perspectiveCookieName)?.value;
  const sessionCookie = cookies.get(previewSessionCookieName)?.value;
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!perspectiveCookie || !sessionCookie || !token) return { perspectiveCookie: undefined };
  return {
    perspectiveCookie:
      (await signPreviewSession(token)) === sessionCookie ? perspectiveCookie : undefined,
  };
}

export async function isDraftMode(cookies: AstroCookies) {
  return Boolean((await getDraftModeProps(cookies)).perspectiveCookie);
}
