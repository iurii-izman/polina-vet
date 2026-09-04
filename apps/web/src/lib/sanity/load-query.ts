import type { ClientPerspective, QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';

const token = import.meta.env.SANITY_API_READ_TOKEN;

function parsePerspective(raw: string | undefined): ClientPerspective | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('[')) {
    try {
      return JSON.parse(decoded) as ClientPerspective;
    } catch {
      return undefined;
    }
  }
  return decoded as ClientPerspective;
}

/** Published fetches stay token-free; only an authenticated draft request can enable stega. */
export async function loadQuery<QueryResponse>(input: {
  query: string;
  params?: QueryParams;
  perspectiveCookie?: string;
}) {
  const draftMode = Boolean(input.perspectiveCookie);
  if (draftMode && !token) throw new Error('PREVIEW_RUNTIME_TOKEN_REQUIRED');
  const perspective = draftMode
    ? (parsePerspective(input.perspectiveCookie) ?? 'drafts')
    : 'published';
  const response = await sanityClient.fetch<QueryResponse>(input.query, input.params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: draftMode ? 'withKeyArraySelector' : false,
    stega: draftMode,
    ...(draftMode ? { token } : {}),
  });
  return { data: response.result, sourceMap: response.resultSourceMap, perspective };
}

export async function fetchSanity<QueryResponse>(
  query: string,
  params: QueryParams = {},
  perspectiveCookie?: string,
) {
  if (perspectiveCookie)
    return (await loadQuery<QueryResponse>({ query, params, perspectiveCookie })).data;
  return sanityClient.fetch<QueryResponse>(query, params);
}
