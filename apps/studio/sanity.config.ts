import { defineConfig } from 'sanity';
import { type DocumentActionComponent } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { presentationTool } from 'sanity/presentation';

import { SANITY_API_VERSION } from '../../sanity.shared';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './structure';
import { resolve } from './lib/resolve';
import { translationActions } from './lib/translationActions';

const singletonActions = (prev: DocumentActionComponent[]) =>
  prev.filter(({ action }) => !['duplicate', 'delete', 'create'].includes(action ?? ''));

export default defineConfig({
  name: 'polina-vet',
  title: 'POLINA VET',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'configure-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  apiVersion: SANITY_API_VERSION,
  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
    presentationTool({
      resolve,
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_URL ?? 'http://localhost:4321',
        previewMode: { enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable' },
      },
    }),
  ],
  document: {
    actions: (prev, context) => {
      const base = context.schemaType === 'siteSettings' ? singletonActions(prev) : prev;
      return context.schemaType === 'article' ? [...base, ...translationActions] : base;
    },
  },
  schema: { types: schemaTypes },
});
