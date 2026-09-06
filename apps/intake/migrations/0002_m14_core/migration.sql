PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  display_name TEXT NOT NULL,
  locality TEXT,
  address_text TEXT,
  notes TEXT,
  archived_at TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS client_contacts (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('PHONE', 'TELEGRAM', 'EMAIL', 'OTHER')),
  value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  display_name TEXT,
  primary_client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  locality TEXT NOT NULL,
  address_text TEXT,
  notes TEXT,
  archived_at TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('PET', 'FARM')),
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  holding_id TEXT REFERENCES holdings(id) ON DELETE SET NULL,
  name TEXT,
  identifier TEXT,
  species_code TEXT NOT NULL,
  species_text TEXT,
  breed TEXT,
  sex TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (sex IN ('MALE', 'FEMALE', 'UNKNOWN')),
  reproductive_status TEXT,
  birth_date TEXT,
  age_text TEXT,
  notes TEXT,
  archived_at TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK (domain = 'PET' OR holding_id IS NOT NULL OR client_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS animal_groups (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  holding_id TEXT NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  display_name TEXT NOT NULL,
  species_code TEXT NOT NULL,
  species_text TEXT,
  approx_count INTEGER CHECK (approx_count IS NULL OR (approx_count >= 0 AND approx_count <= 1000000)),
  age_description TEXT,
  notes TEXT,
  archived_at TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS encounters (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  encounter_type TEXT NOT NULL CHECK (encounter_type IN ('AT_SITE', 'FIELD_VISIT', 'REMOTE')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED')),
  source TEXT NOT NULL CHECK (source IN ('INQUIRY', 'MANUAL')),
  source_inquiry_id TEXT REFERENCES inquiries(id) ON DELETE SET NULL,
  animal_id TEXT REFERENCES animals(id) ON DELETE RESTRICT,
  animal_group_id TEXT REFERENCES animal_groups(id) ON DELETE RESTRICT,
  holding_id TEXT REFERENCES holdings(id) ON DELETE RESTRICT,
  presenting_problem TEXT,
  history TEXT,
  examination_text TEXT,
  assessment TEXT,
  plan TEXT,
  outcome_text TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK ((animal_id IS NOT NULL) + (animal_group_id IS NOT NULL) + (holding_id IS NOT NULL) = 1),
  CHECK ((status = 'DRAFT' AND completed_at IS NULL) OR (status = 'COMPLETED' AND completed_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS encounter_vitals (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL UNIQUE REFERENCES encounters(id) ON DELETE RESTRICT,
  observed_at TEXT NOT NULL,
  weight_kg REAL CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg <= 100000)),
  temperature_c REAL,
  heart_rate_bpm INTEGER CHECK (heart_rate_bpm IS NULL OR (heart_rate_bpm > 0 AND heart_rate_bpm <= 1000)),
  respiratory_rate_per_min INTEGER CHECK (respiratory_rate_per_min IS NULL OR (respiratory_rate_per_min > 0 AND respiratory_rate_per_min <= 500)),
  hydration TEXT,
  mucous_membranes TEXT,
  crt_seconds REAL CHECK (crt_seconds IS NULL OR (crt_seconds >= 0 AND crt_seconds <= 60)),
  pain TEXT,
  observations TEXT
);

CREATE TABLE IF NOT EXISTS encounter_population_counts (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL UNIQUE REFERENCES encounters(id) ON DELETE RESTRICT,
  population_count INTEGER CHECK (population_count IS NULL OR population_count >= 0),
  examined_count INTEGER CHECK (examined_count IS NULL OR examined_count >= 0),
  affected_count INTEGER CHECK (affected_count IS NULL OR affected_count >= 0),
  treated_count INTEGER CHECK (treated_count IS NULL OR treated_count >= 0)
);

CREATE TABLE IF NOT EXISTS clinical_records (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL UNIQUE REFERENCES encounters(id) ON DELETE RESTRICT,
  presenting_problem TEXT,
  history TEXT,
  examination_text TEXT,
  assessment TEXT,
  plan TEXT,
  outcome_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('WORKING', 'DIFFERENTIAL', 'FINAL')),
  label TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS medication_records (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
  drug_name TEXT,
  active_ingredient TEXT,
  dose_value REAL,
  dose_unit TEXT,
  dose_basis TEXT,
  route TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  dose_text TEXT,
  administration_type TEXT NOT NULL CHECK (administration_type IN ('ADMINISTERED', 'PRESCRIBED', 'RECOMMENDED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK (length(trim(COALESCE(drug_name, ''))) > 0 OR length(trim(COALESCE(dose_text, ''))) > 0 OR length(trim(COALESCE(instructions, ''))) > 0)
);

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('WOUND_TREATMENT', 'INJECTION', 'CATHETER', 'INFUSION', 'SURGERY', 'DRESSING', 'SAMPLING', 'OTHER')),
  label TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS vaccinations (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT REFERENCES encounters(id) ON DELETE SET NULL,
  animal_id TEXT REFERENCES animals(id) ON DELETE RESTRICT,
  animal_group_id TEXT REFERENCES animal_groups(id) ON DELETE RESTRICT,
  date TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  manufacturer TEXT,
  batch_lot TEXT,
  route TEXT,
  next_due_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK ((animal_id IS NOT NULL) + (animal_group_id IS NOT NULL) = 1)
);

CREATE TABLE IF NOT EXISTS clinical_followups (
  id TEXT PRIMARY KEY NOT NULL,
  encounter_id TEXT NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
  animal_id TEXT REFERENCES animals(id) ON DELETE RESTRICT,
  animal_group_id TEXT REFERENCES animal_groups(id) ON DELETE RESTRICT,
  holding_id TEXT REFERENCES holdings(id) ON DELETE RESTRICT,
  due_at TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'DONE', 'CANCELLED')),
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  CHECK ((animal_id IS NOT NULL) + (animal_group_id IS NOT NULL) + (holding_id IS NOT NULL) = 1)
);

CREATE TABLE IF NOT EXISTS patient_alerts (
  id TEXT PRIMARY KEY NOT NULL,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('ALLERGY', 'ADVERSE_REACTION', 'BEHAVIOR', 'CHRONIC', 'OTHER')),
  short_label TEXT NOT NULL,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  actor TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('CLINICIAN', 'TECH_ADMIN')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  request_id TEXT NOT NULL,
  changed_fields TEXT NOT NULL DEFAULT '[]',
  result TEXT NOT NULL CHECK (result IN ('SUCCESS', 'CONFLICT', 'FAILURE'))
);

CREATE INDEX IF NOT EXISTS clients_display_name_idx ON clients(display_name);
CREATE INDEX IF NOT EXISTS clients_locality_idx ON clients(locality);
CREATE INDEX IF NOT EXISTS client_contacts_normalized_idx ON client_contacts(normalized_value);
CREATE INDEX IF NOT EXISTS holdings_locality_idx ON holdings(locality);
CREATE INDEX IF NOT EXISTS holdings_client_idx ON holdings(primary_client_id);
CREATE INDEX IF NOT EXISTS animals_identifier_idx ON animals(identifier);
CREATE INDEX IF NOT EXISTS animals_name_idx ON animals(name);
CREATE INDEX IF NOT EXISTS animals_client_idx ON animals(client_id);
CREATE INDEX IF NOT EXISTS animals_holding_idx ON animals(holding_id);
CREATE INDEX IF NOT EXISTS animal_groups_holding_idx ON animal_groups(holding_id);
CREATE INDEX IF NOT EXISTS encounters_started_idx ON encounters(started_at DESC);
CREATE INDEX IF NOT EXISTS encounters_source_inquiry_idx ON encounters(source_inquiry_id);
CREATE INDEX IF NOT EXISTS encounter_vitals_encounter_idx ON encounter_vitals(encounter_id);
CREATE INDEX IF NOT EXISTS diagnoses_encounter_idx ON diagnoses(encounter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS medication_encounter_idx ON medication_records(encounter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS procedures_encounter_idx ON procedures(encounter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS vaccinations_animal_idx ON vaccinations(animal_id, date DESC);
CREATE INDEX IF NOT EXISTS vaccinations_group_idx ON vaccinations(animal_group_id, date DESC);
CREATE INDEX IF NOT EXISTS followups_due_idx ON clinical_followups(status, due_at);
CREATE INDEX IF NOT EXISTS alerts_animal_idx ON patient_alerts(animal_id, active);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_events(entity_type, entity_id, created_at DESC);
