import { defineConfig } from 'sanity';
import { type DocumentActionComponent } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { SANITY_API_VERSION } from '../../sanity.shared';
import { schemaTypes } from './schemaTypes';
import { deskStructure } from './structure';

const singletonActions = (prev: DocumentActionComponent[]) =>
  prev.filter(({ action }) => !['duplicate', 'delete', 'create'].includes(action ?? ''));

export default defineConfig({
  name: 'polina-vet',
  title: 'POLINA VET',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'configure-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  apiVersion: SANITY_API_VERSION,
  plugins: [structureTool({ structure: deskStructure }), visionTool()],
  document: {
    actions: (prev, context) =>
      context.schemaType === 'siteSettings' ? singletonActions(prev) : prev,
  },
  schema: { types: schemaTypes },
});
