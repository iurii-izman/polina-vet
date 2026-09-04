// Server-only preview configuration. The public build continues to use astro.config.mjs.
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import { loadEnv } from 'vite';
import { SANITY_API_VERSION } from '../../sanity.shared.ts';

const env = loadEnv('preview', process.cwd(), '');
if (!env.PUBLIC_SANITY_PROJECT_ID || !env.PUBLIC_SANITY_DATASET)
  throw new Error('PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET are required for preview.');
const visualEditingRequire = createRequire(
  realpathSync(new URL('./node_modules/@sanity/visual-editing/package.json', import.meta.url)),
);
const lodashEsRoot = dirname(visualEditingRequire.resolve('lodash-es'));
const visualEditingReactEntry = visualEditingRequire.resolve('@sanity/visual-editing/react');
const reactCompilerRuntime = fileURLToPath(
  new URL('./src/preview/react-compiler-runtime.ts', import.meta.url),
);
const reactIsShim = fileURLToPath(new URL('./src/preview/react-is.ts', import.meta.url));
const styledComponentsEsm = join(
  dirname(visualEditingRequire.resolve('styled-components')),
  'styled-components.esm.js',
);
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  vite: {
    // Vite 8's dependency optimizer misreads styled-components' package entry
    // when bundling Sanity Visual Editing. Leave the preview-only client graph
    // unoptimized so the browser can load its ESM entry points directly.
    optimizeDeps: { exclude: ['@sanity/visual-editing', '@sanity/ui', 'styled-components'] },
    resolve: {
      alias: [
        {
          find: 'polina-vet-preview/visual-editing',
          replacement: fileURLToPath(
            new URL('./src/components/SanityVisualEditing.tsx', import.meta.url),
          ),
        },
        {
          find: 'polina-vet-preview/disable-draft-mode',
          replacement: fileURLToPath(
            new URL('./src/components/DisableDraftMode.tsx', import.meta.url),
          ),
        },
        { find: 'react/compiler-runtime', replacement: reactCompilerRuntime },
        { find: 'react-is', replacement: reactIsShim },
        { find: 'styled-components', replacement: styledComponentsEsm },
        { find: /^lodash(\/.*)?$/, replacement: `${lodashEsRoot}$1` },
      ],
    },
    plugins: [
      {
        enforce: 'pre',
        name: 'preview-sanity-client-entrypoints',
        resolveId(source) {
          if (source === '@sanity/visual-editing/react') {
            return `${visualEditingReactEntry}?preview-runtime-v4`;
          }
          if (source === 'react/compiler-runtime') return reactCompilerRuntime;
          if (source === 'react-is') return reactIsShim;
          if (source === 'styled-components') return styledComponentsEsm;
          return null;
        },
        transform(code, id) {
          if (!id.includes('@sanity+visual-editing') && !id.includes('@sanity+ui')) return null;
          return code
            .replaceAll(
              '"react/compiler-runtime"',
              JSON.stringify(`${reactCompilerRuntime}?preview-runtime-v3`),
            )
            .replaceAll('"react-is"', JSON.stringify(`${reactIsShim}?preview-runtime-v3`))
            .replaceAll(
              '"styled-components"',
              JSON.stringify(`${styledComponentsEsm}?preview-runtime-v3`),
            )
            .replaceAll("'styled-components'", `'${styledComponentsEsm}?preview-runtime-v3'`)
            .replaceAll('.js"', '.js?preview-runtime-v3"')
            .replaceAll(".js'", ".js?preview-runtime-v3'")
            .replaceAll('"@sanity/ui"', '"@sanity/ui?preview-runtime-v3"')
            .replaceAll("'@sanity/ui'", "'@sanity/ui?preview-runtime-v3'");
        },
      },
    ],
  },
  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID,
      dataset: env.PUBLIC_SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: false,
      stega: { studioUrl: env.SANITY_STUDIO_URL ?? 'http://localhost:3333' },
    }),
    react(),
  ],
  i18n: {
    locales: ['ru', 'ro', 'uk'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
});
