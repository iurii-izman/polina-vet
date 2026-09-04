export type DeploymentTarget = 'local' | 'staging' | 'preview' | 'production';

const configuredUrl = import.meta.env.SITE_URL?.trim();
const configuredTarget = import.meta.env.DEPLOYMENT_TARGET?.trim();

/** Unknown targets and values are intentionally non-indexable. */
export const deploymentTarget: DeploymentTarget =
  configuredTarget === 'staging' ||
  configuredTarget === 'preview' ||
  configuredTarget === 'production' ||
  configuredTarget === 'local'
    ? configuredTarget
    : 'local';

export const siteUrl = new URL(configuredUrl || 'http://localhost:4321');
export const siteIndexable =
  import.meta.env.SITE_INDEXABLE === 'true' && deploymentTarget === 'production';

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteUrl).toString();
}

export function robotsForPage(explicit?: string, draftMode = false): string {
  if (explicit) return explicit;
  if (draftMode || !siteIndexable) return 'noindex, nofollow, noarchive';
  return 'index, follow';
}
