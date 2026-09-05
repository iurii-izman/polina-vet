export const analyticsEvents = [
  'contact_click',
  'map_open',
  'urgent_open',
  'domain_select',
  'knowledge_open',
  'language_switch',
  'outbound_social',
  'useful_next_step',
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
export type AnalyticsProperties = Readonly<Record<string, string>>;

const allowedProperties: Record<AnalyticsEvent, readonly string[]> = {
  contact_click: ['channel', 'locale', 'surface'],
  map_open: ['locale', 'surface'],
  urgent_open: ['domain', 'locale', 'surface'],
  domain_select: ['domain', 'locale', 'surface'],
  knowledge_open: ['domain', 'locale', 'surface'],
  language_switch: ['from', 'to', 'surface'],
  outbound_social: ['channel', 'locale', 'surface'],
  useful_next_step: ['kind', 'domain', 'locale', 'surface'],
};

export function sanitizeProperties(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
): AnalyticsProperties {
  const allowed = new Set(allowedProperties[event]);
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) => allowed.has(key) && typeof value === 'string' && value.length <= 80,
    ),
  );
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  const payload = { event, properties: sanitizeProperties(event, properties) };
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('polina:analytics', { detail: payload }));
  const provider = window.__POLINA_ANALYTICS__;
  try {
    provider?.track(event, payload.properties);
  } catch {
    /* measurement must never block navigation */
  }
}

declare global {
  interface Window {
    __POLINA_ANALYTICS__?: {
      track: (event: AnalyticsEvent, properties: AnalyticsProperties) => void;
    };
  }
}
