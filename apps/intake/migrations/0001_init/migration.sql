PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  public_ref TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('ru', 'ro', 'uk')),
  domain TEXT NOT NULL CHECK (domain IN ('PET', 'FARM')),
  source TEXT NOT NULL,
  acquisition_source TEXT NOT NULL,
  contact_channel TEXT NOT NULL,
  preferred_contact_channel TEXT NOT NULL,
  person_name TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  locality TEXT NOT NULL,
  address TEXT,
  species TEXT NOT NULL,
  species_other TEXT,
  group_scope TEXT CHECK (group_scope IS NULL OR group_scope IN ('single', 'multiple')),
  affected_count INTEGER,
  reason TEXT NOT NULL,
  onset TEXT,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'WAITING', 'FOLLOW_UP', 'CLOSED')),
  outcome TEXT CHECK (outcome IS NULL OR outcome IN ('visit_at_site', 'field_visit', 'advice_given', 'follow_up_completed', 'no_response', 'declined', 'duplicate', 'spam', 'other')),
  assigned_to TEXT,
  follow_up_at TEXT,
  last_contact_at TEXT,
  closed_at TEXT,
  privacy_notice_version TEXT,
  privacy_notice_acknowledged_at TEXT,
  retention_until TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id TEXT PRIMARY KEY NOT NULL,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiry_events (
  id TEXT PRIMARY KEY NOT NULL,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'FOLLOW_UP_SET', 'FOLLOW_UP_CLEARED', 'CONTACT_RECORDED', 'NOTE_ADDED', 'OUTCOME_SET', 'CLOSED', 'REOPENED')),
  actor TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id TEXT PRIMARY KEY NOT NULL,
  inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disabled', 'delivered', 'failed')),
  error_category TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status);
CREATE INDEX IF NOT EXISTS inquiries_follow_up_idx ON inquiries(follow_up_at);
CREATE INDEX IF NOT EXISTS inquiries_domain_idx ON inquiries(domain);
CREATE INDEX IF NOT EXISTS inquiries_assigned_to_idx ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS inquiries_source_idx ON inquiries(source);
CREATE INDEX IF NOT EXISTS inquiry_notes_inquiry_idx ON inquiry_notes(inquiry_id, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiry_events_inquiry_idx ON inquiry_events(inquiry_id, created_at DESC);
