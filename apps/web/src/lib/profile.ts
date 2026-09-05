export const serviceModeLabels: Record<string, string> = {
  personalInquiry: 'Личное обращение',
  appointment: 'Приём',
  fieldVisit: 'Выезд',
};

export const channelTypes = [
  'telegram',
  'viber',
  'phone',
  'instagram',
  'facebook',
  'whatsapp',
  'tiktok',
  'youtube',
] as const;
export type ChannelType = (typeof channelTypes)[number];
export interface PublicChannel {
  type: ChannelType;
  value: string;
  priority: number;
  label?: string;
}

const channelPriority: Record<ChannelType, number> = {
  telegram: 1,
  viber: 2,
  phone: 3,
  instagram: 4,
  facebook: 5,
  whatsapp: 6,
  tiktok: 7,
  youtube: 8,
};

function validExternalUrl(value: string, type: ChannelType): string | undefined {
  if (type === 'viber' && /^viber:\/\/chat\?number=\+?\d{7,15}$/.test(value)) return value;
  if (type === 'whatsapp' && /^whatsapp:\/\/send\?phone=\+?\d{7,15}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return undefined;
    if (type === 'telegram' && url.hostname !== 't.me' && url.hostname !== 'telegram.me')
      return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function normalizeChannels(
  input:
    | Array<{
        type?: string | null;
        label?: string | null;
        url?: string | null;
        enabled?: boolean | null;
        priority?: number | null;
      }>
    | null
    | undefined,
  contacts?: { primaryPhone?: string | null; telegramHandle?: string | null } | null,
): PublicChannel[] {
  const result: PublicChannel[] = [];
  const add = (
    type: ChannelType,
    value: string | null | undefined,
    priority: number,
    label?: string | null,
  ) => {
    if (!value || result.some((channel) => channel.type === type)) return;
    const normalized =
      type === 'phone'
        ? safePhoneHref(value)
        : type === 'telegram' && !value.includes('://')
          ? safeTelegramHref(value)
          : validExternalUrl(value, type);
    if (normalized) result.push({ type, value: normalized, priority, label: label ?? undefined });
  };
  add('telegram', contacts?.telegramHandle, channelPriority.telegram);
  add('phone', contacts?.primaryPhone, channelPriority.phone);
  for (const channel of input ?? []) {
    if (!channel.enabled || !channelTypes.includes(channel.type as ChannelType) || !channel.url)
      continue;
    add(
      channel.type as ChannelType,
      channel.url,
      channel.priority ?? channelPriority[channel.type as ChannelType],
      channel.label,
    );
  }
  return result.sort((a, b) => a.priority - b.priority);
}

export function safePhoneHref(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const value = phone.replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(value) ? `tel:${value}` : undefined;
}

export function safeTelegramHref(handle: string | null | undefined): string | undefined {
  if (!handle) return undefined;
  const value = handle.replace(/^@/, '');
  return /^\w{5,32}$/.test(value) ? `https://t.me/${value}` : undefined;
}

export function safeMapHref(mapUrl: string | null | undefined): string | undefined {
  if (!mapUrl) return undefined;
  try {
    const url = new URL(mapUrl);
    return url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
