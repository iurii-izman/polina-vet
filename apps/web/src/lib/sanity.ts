import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '56xqpcyi',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-01-01',
  useCdn: true,
});
