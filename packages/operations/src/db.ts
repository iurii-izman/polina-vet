import { createOpaqueId, createPublicReference } from './ids.js';
import type {
  InquiryRecord,
  InquiryStatus,
  OfficeInquiryInput,
  PublicInquiryInput,
  InquiryOutcome,
} from './domain.js';
import { canTransition } from './domain.js';
import { retentionUntil } from './retentionPolicy.js';

export type D1Result<T = unknown> = { results?: T[]; success?: boolean; meta?: unknown };
export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
};
export type OperationsDb = {
  prepare(query: string): D1Statement;
  batch?(statements: D1Statement[]): Promise<D1Result[]>;
};

const iso = (date = new Date()) => date.toISOString();
function event(
  db: OperationsDb,
  inquiryId: string,
  type: string,
  actor: string | null,
  metadata: Record<string, string | null> = {},
) {
  return db
    .prepare(
      'INSERT INTO inquiry_events (id, inquiry_id, event_type, actor, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(createOpaqueId(), inquiryId, type, actor, JSON.stringify(metadata), iso())
    .run();
}

function inquiryValues(input: PublicInquiryInput | OfficeInquiryInput, now: string) {
  const office = input as OfficeInquiryInput;
  return [
    createOpaqueId(),
    createPublicReference(),
    now,
    now,
    input.locale,
    input.domain,
    office.source ?? 'web_form',
    input.acquisitionSource ?? 'unknown',
    office.contactChannel ?? input.preferredContactChannel,
    input.preferredContactChannel,
    input.personName,
    input.contactValue,
    input.locality,
    input.address ?? null,
    input.species,
    input.speciesOther ?? null,
    input.groupScope ?? null,
    input.affectedCount ?? null,
    input.reason,
    input.onset ?? null,
    input.summary,
    'NEW',
    null,
    null,
    null,
    null,
    null,
    'privacyNoticeVersion' in input ? input.privacyNoticeVersion : null,
    'privacyAcknowledged' in input && input.privacyAcknowledged ? now : null,
    null,
    input.utmSource ?? null,
    input.utmMedium ?? null,
    input.utmCampaign ?? null,
    input.utmContent ?? null,
  ];
}

export async function createInquiry(
  db: OperationsDb,
  input: PublicInquiryInput | OfficeInquiryInput,
  idempotencyKey: string,
  actor: string | null = null,
) {
  const existing = await db
    .prepare('SELECT * FROM inquiries WHERE idempotency_key = ?')
    .bind(idempotencyKey)
    .first<InquiryRecord>();
  if (existing) return { inquiry: existing, created: false };
  const values = inquiryValues(input, iso());
  const id = values[0] as string;
  const publicRef = values[1] as string;
  const query = `INSERT INTO inquiries (
    id, public_ref, created_at, updated_at, locale, domain, source, acquisition_source,
    contact_channel, preferred_contact_channel, person_name, contact_value, locality, address,
    species, species_other, group_scope, affected_count, reason, onset, summary, status, outcome,
    assigned_to, follow_up_at, last_contact_at, closed_at, privacy_notice_version,
    privacy_notice_acknowledged_at, retention_until, utm_source, utm_medium, utm_campaign, utm_content, idempotency_key
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    await db
      .prepare(query)
      .bind(...values, idempotencyKey)
      .run();
  } catch (error) {
    const race = await db
      .prepare('SELECT * FROM inquiries WHERE idempotency_key = ?')
      .bind(idempotencyKey)
      .first<InquiryRecord>();
    if (race) return { inquiry: race, created: false };
    throw error;
  }
  await event(db, id, 'CREATED', actor, { source: String(values[6]), domain: String(values[5]) });
  const inquiry = await db
    .prepare('SELECT * FROM inquiries WHERE id = ?')
    .bind(id)
    .first<InquiryRecord>();
  if (!inquiry) throw new Error(`Inquiry ${publicRef} was not readable after creation`);
  return { inquiry, created: true };
}

export async function listInquiries(
  db: OperationsDb,
  filters: {
    status?: string;
    domain?: string;
    source?: string;
    followUp?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const clauses: string[] = [];
  const args: unknown[] = [];
  if (filters.status) {
    clauses.push('status = ?');
    args.push(filters.status);
  }
  if (filters.domain) {
    clauses.push('domain = ?');
    args.push(filters.domain);
  }
  if (filters.source) {
    clauses.push('source = ?');
    args.push(filters.source);
  }
  if (filters.followUp === 'due')
    clauses.push(
      "follow_up_at IS NOT NULL AND follow_up_at <= datetime('now') AND status <> 'CLOSED'",
    );
  if (filters.followUp === 'overdue')
    clauses.push(
      "follow_up_at IS NOT NULL AND follow_up_at < datetime('now') AND status <> 'CLOSED'",
    );
  if (filters.search) {
    clauses.push(
      '(public_ref LIKE ? OR person_name LIKE ? OR contact_value LIKE ? OR locality LIKE ?)',
    );
    const q = `%${filters.search.slice(0, 120)}%`;
    args.push(q, q, q, q);
  }
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
  const offset = Math.max(filters.offset ?? 0, 0);
  const query = `SELECT * FROM inquiries ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY CASE WHEN status = 'NEW' THEN 0 WHEN follow_up_at IS NOT NULL AND follow_up_at <= datetime('now') THEN 1 ELSE 2 END, created_at DESC LIMIT ? OFFSET ?`;
  const result = await db
    .prepare(query)
    .bind(...args, limit, offset)
    .all<InquiryRecord>();
  return result.results ?? [];
}

export async function getInquiry(db: OperationsDb, id: string) {
  const inquiry = await db
    .prepare('SELECT * FROM inquiries WHERE id = ? OR public_ref = ?')
    .bind(id, id)
    .first<InquiryRecord>();
  if (!inquiry) return null;
  const notes = await db
    .prepare(
      'SELECT id, body, created_at, created_by FROM inquiry_notes WHERE inquiry_id = ? ORDER BY created_at DESC',
    )
    .bind(inquiry.id)
    .all();
  const events = await db
    .prepare(
      'SELECT id, event_type, actor, metadata, created_at FROM inquiry_events WHERE inquiry_id = ? ORDER BY created_at DESC',
    )
    .bind(inquiry.id)
    .all();
  return { inquiry, notes: notes.results ?? [], events: events.results ?? [] };
}

export async function updateStatus(
  db: OperationsDb,
  id: string,
  status: InquiryStatus,
  outcome: InquiryOutcome | null,
  actor: string,
) {
  const current = await db
    .prepare('SELECT * FROM inquiries WHERE id = ? OR public_ref = ?')
    .bind(id, id)
    .first<InquiryRecord>();
  if (!current) return { ok: false as const, error: 'not_found' };
  if (!canTransition(current.status, status))
    return { ok: false as const, error: 'invalid_transition' };
  if (status === 'CLOSED' && !outcome) return { ok: false as const, error: 'outcome_required' };
  const closedAt = status === 'CLOSED' ? iso() : null;
  const retentionDate = status === 'CLOSED' ? retentionUntil(new Date()) : null;
  await db
    .prepare(
      'UPDATE inquiries SET status = ?, outcome = ?, closed_at = ?, retention_until = ?, updated_at = ? WHERE id = ?',
    )
    .bind(status, outcome, closedAt, retentionDate, iso(), current.id)
    .run();
  await event(
    db,
    current.id,
    status === 'CLOSED' ? 'CLOSED' : current.status === 'CLOSED' ? 'REOPENED' : 'STATUS_CHANGED',
    actor,
    { from: current.status, to: status, outcome },
  );
  return { ok: true as const };
}

export async function setFollowUp(
  db: OperationsDb,
  id: string,
  followUpAt: string | null,
  actor: string,
) {
  const current = await db
    .prepare('SELECT id FROM inquiries WHERE id = ? OR public_ref = ?')
    .bind(id, id)
    .first<{ id: string }>();
  if (!current) return { ok: false as const, error: 'not_found' };
  if (followUpAt && Number.isNaN(Date.parse(followUpAt)))
    return { ok: false as const, error: 'invalid_date' };
  await db
    .prepare('UPDATE inquiries SET follow_up_at = ?, updated_at = ? WHERE id = ?')
    .bind(followUpAt, iso(), current.id)
    .run();
  await event(db, current.id, followUpAt ? 'FOLLOW_UP_SET' : 'FOLLOW_UP_CLEARED', actor, {});
  return { ok: true as const };
}

export async function markContacted(db: OperationsDb, id: string, actor: string) {
  const current = await db
    .prepare('SELECT id FROM inquiries WHERE id = ? OR public_ref = ?')
    .bind(id, id)
    .first<{ id: string }>();
  if (!current) return { ok: false as const, error: 'not_found' };
  const now = iso();
  await db
    .prepare('UPDATE inquiries SET last_contact_at = ?, updated_at = ? WHERE id = ?')
    .bind(now, now, current.id)
    .run();
  await event(db, current.id, 'CONTACT_RECORDED', actor, {});
  return { ok: true as const };
}

export async function addNote(db: OperationsDb, id: string, body: string, actor: string) {
  const current = await db
    .prepare('SELECT id FROM inquiries WHERE id = ? OR public_ref = ?')
    .bind(id, id)
    .first<{ id: string }>();
  if (!current || !body.trim() || body.trim().length > 2000)
    return { ok: false as const, error: !current ? 'not_found' : 'invalid_note' };
  await db
    .prepare(
      'INSERT INTO inquiry_notes (id, inquiry_id, body, created_at, created_by) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(createOpaqueId(), current.id, body.trim(), iso(), actor)
    .run();
  await event(db, current.id, 'NOTE_ADDED', actor, {});
  return { ok: true as const };
}

export async function retentionDryRun(db: OperationsDb, now = new Date()) {
  const result = await db
    .prepare(
      "SELECT public_ref FROM inquiries WHERE status = 'CLOSED' AND retention_until IS NOT NULL AND retention_until <= ? ORDER BY retention_until ASC",
    )
    .bind(now.toISOString())
    .all<{ public_ref: string }>();
  return result.results ?? [];
}

export async function purgeExpired(db: OperationsDb, now = new Date()) {
  const expired = await retentionDryRun(db, now);
  for (const row of expired)
    await db.prepare('DELETE FROM inquiries WHERE public_ref = ?').bind(row.public_ref).run();
  return expired.length;
}
