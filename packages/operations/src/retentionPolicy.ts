const RETENTION_DAYS = 365;

export const retentionUntil = (date: Date) =>
  new Date(date.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

export function inquiryRetentionDeadline(createdAt: string, closedAt?: string | null): string {
  const absolute = retentionUntil(new Date(createdAt));
  if (!closedAt) return absolute;
  const closed = retentionUntil(new Date(closedAt));
  return closed < absolute ? closed : absolute;
}
