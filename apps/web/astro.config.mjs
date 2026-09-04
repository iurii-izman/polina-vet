// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

import { SANITY_API_VERSION } from '../../sanity.shared.ts';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET;
const site = env.SITE_URL || 'http://localhost:4321';

if (!projectId || !dataset) {
  throw new Error(
    'PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET are required. Copy apps/web/.env.example to apps/web/.env.',
  );
}

export default defineConfig({
  output: 'static',
  site,
  vite: {
    resolve: {
      alias: {
        'polina-vet-preview/visual-editing': fileURLToPath(
          new URL('./src/components/NoopPreviewIsland.tsx', import.meta.url),
        ),
        'polina-vet-preview/disable-draft-mode': fileURLToPath(
          new URL('./src/components/NoopPreviewIsland.tsx', import.meta.url),
        ),
      },
    },
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
    }),
    react(),
  ],
  trailingSlash: 'always',
  i18n: {
    locales: ['ru', 'ro', 'uk'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
});
