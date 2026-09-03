export const serviceModeLabels: Record<string, string> = {
  personalInquiry: 'Личное обращение',
  appointment: 'Приём',
  fieldVisit: 'Выезд',
};

export function safePhoneHref(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const value = phone.replace(/[\s().-]/g, '');
  return /^\+?[0-9]{7,15}$/.test(value) ? `tel:${value}` : undefined;
}

export function safeTelegramHref(handle: string | null | undefined): string | undefined {
  if (!handle) return undefined;
  const value = handle.replace(/^@/, '');
  return /^[A-Za-z0-9_]{5,32}$/.test(value) ? `https://t.me/${value}` : undefined;
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
