import { article } from './article';
import { author } from './author';
import { clinicalCase } from './clinicalCase';
import { page } from './page';
import { siteSettings } from './siteSettings';
import { source } from './source';
import { species } from './species';
import { topic } from './topic';
import { medicalBlockTypes } from './medicalBlocks';

export const schemaTypes = [
  article,
  page,
  author,
  species,
  topic,
  source,
  siteSettings,
  clinicalCase,
  ...medicalBlockTypes,
];
