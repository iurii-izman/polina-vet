const RETENTION_DAYS = 365;

export const retentionUntil = (date: Date) =>
  new Date(date.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
