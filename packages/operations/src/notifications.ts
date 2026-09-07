import type { InquiryRecord } from './domain.js';

export type TelegramResult = { enabled: boolean; delivered: boolean; error?: string };

const unsafeDisplayCharacters =
  /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069\ufff9-\ufffb]/gu;

export function safeTelegramLocality(value: unknown): string {
  if (typeof value !== 'string') return 'Не указана';
  const normalized = value
    .normalize('NFC')
    .replace(unsafeDisplayCharacters, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  return normalized.slice(0, 120) || 'Не указана';
}

export async function notifyNewInquiry(
  inquiry: InquiryRecord,
  config: { token?: string; chatId?: string; officeUrl?: string },
): Promise<TelegramResult> {
  if (!config.token || !config.chatId) return { enabled: false, delivered: false };
  const text = `Новое обращение #${inquiry.public_ref}\n${inquiry.domain === 'PET' ? 'Pets' : 'Farm'} · ${safeTelegramLocality(inquiry.locality)}\n${config.officeUrl ? `Открыть Office → ${config.officeUrl}` : 'Открыть Office'}`;
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(config.token)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: config.chatId, text }),
      },
    );
    if (!response.ok)
      return { enabled: true, delivered: false, error: `telegram_${response.status}` };
    return { enabled: true, delivered: true };
  } catch {
    return { enabled: true, delivered: false, error: 'telegram_network' };
  }
}
