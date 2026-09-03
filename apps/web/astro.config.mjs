// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';

import { SANITY_API_VERSION } from '../../sanity.shared.ts';

const env = loadEnv('development', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    'PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET are required. Copy apps/web/.env.example to apps/web/.env.',
  );
}

export default defineConfig({
  output: 'static',
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
    }),
  ],
  trailingSlash: 'always',
  i18n: {
    locales: ['ru', 'ro', 'uk'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
});
