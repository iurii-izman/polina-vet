import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;
const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null;

export function sanityImageUrl(source: unknown, width: number): string | undefined {
  if (!builder || !source) return undefined;
  return builder.image(source).width(width).auto('format').fit('crop').url();
}
