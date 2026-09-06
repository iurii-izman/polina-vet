import { createOpaqueId } from './ids.js';
import type { OperationsDb } from './db.js';
import type {
  AnimalGroupInput,
  AnimalInput,
  ClientInput,
  DiagnosisInput,
  EncounterInput,
  FollowUpInput,
  HoldingInput,
  M14Actor,
  MedicationInput,
  PatientAlertInput,
  ProcedureInput,
  VaccinationInput,
} from './domain.js';

const iso = () => new Date().toISOString();
const clean = (value: string | undefined | null) => value?.trim() || null;
const jsonFields = (fields: string[]) =>
  JSON.stringify([...new Set(fields)].filter((field) => /^[a-z][a-z0-9_]{0,50}$/.test(field)));

async function audit(
  db: OperationsDb,
  actor: M14Actor,
  entityType: string,
  entityId: string,
  action: string,
  changedFields: string[] = [],
  result: 'SUCCESS' | 'CONFLICT' | 'FAILURE' = 'SUCCESS',
) {
  await db
    .prepare(
      'INSERT INTO audit_events (id, created_at, actor, actor_role, entity_type, entity_id, action, request_id, changed_fields, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      createOpaqueId(),
      iso(),
      actor.actor,
      actor.role,
      entityType,
      entityId,
      action,
      actor.requestId,
      jsonFields(changedFields),
      result,
    )
    .run();
}

function recordValues(input: Record<string, unknown>, fields: string[]) {
  return fields.map((field) => input[field] ?? null);
}

async function currentVersion(db: OperationsDb, table: string, id: string) {
  if (!/^[a-z_]+$/.test(table)) throw new Error('invalid_table');
  return db
    .prepare(`SELECT record_version FROM ${table} WHERE id = ?`)
    .bind(id)
    .first<{ record_version: number }>();
}

async function updateVersioned(
  db: OperationsDb,
  table: string,
  id: string,
  recordVersion: number,
  assignments: string,
  values: unknown[],
  actor: M14Actor,
  entityType: string,
  action: string,
  fields: string[],
) {
  if (!Number.isInteger(recordVersion) || recordVersion < 1)
    return { ok: false as const, error: 'validation' };
  const result = await db
    .prepare(
      `UPDATE ${table} SET ${assignments}, record_version = record_version + 1 WHERE id = ? AND record_version = ?`,
    )
    .bind(...values, iso(), actor.actor, id, recordVersion)
    .run();
  const changed = Number((result as { meta?: { changes?: number } }).meta?.changes ?? 0);
  if (changed !== 1) {
    await audit(db, actor, entityType, id, action, fields, 'CONFLICT');
    return { ok: false as const, error: 'conflict' };
  }
  await audit(db, actor, entityType, id, action, fields);
  return { ok: true as const };
}

export async function findClientMatches(db: OperationsDb, input: ClientInput) {
  const name = `%${input.displayName.trim().slice(0, 160)}%`;
  const locality = input.locality?.trim() || '';
  const contact = input.contacts?.[0]?.value?.trim() || '';
  const result = await db
    .prepare(
      `SELECT DISTINCT c.id, c.display_name, c.locality, cc.normalized_value AS contact_value
     FROM clients c LEFT JOIN client_contacts cc ON cc.client_id = c.id
     WHERE c.archived_at IS NULL AND (c.display_name LIKE ? OR c.locality = ? OR cc.normalized_value = ?)
     ORDER BY c.updated_at DESC LIMIT 20`,
    )
    .bind(name, locality, contact)
    .all();
  return result.results ?? [];
}

export async function createClient(db: OperationsDb, input: ClientInput, actor: M14Actor) {
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO clients (id, created_at, updated_at, display_name, locality, address_text, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      now,
      now,
      input.displayName.trim(),
      clean(input.locality),
      clean(input.addressText),
      clean(input.notes),
      actor.actor,
      actor.actor,
    )
    .run();
  for (const contact of input.contacts ?? []) {
    const value = contact.value.trim();
    await db
      .prepare(
        'INSERT INTO client_contacts (id, client_id, type, value, normalized_value, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        createOpaqueId(),
        id,
        contact.type,
        value,
        contact.type === 'EMAIL' ? value.toLowerCase() : value.replace(/[()\s-]+/g, ''),
        contact.isPrimary ? 1 : 0,
        now,
      )
      .run();
  }
  await audit(db, actor, 'CLIENT', id, 'CLIENT_CREATED', ['display_name', 'locality', 'contacts']);
  return id;
}

export async function updateClient(
  db: OperationsDb,
  id: string,
  input: ClientInput,
  version: number,
  actor: M14Actor,
) {
  return updateVersioned(
    db,
    'clients',
    id,
    version,
    'display_name = ?, locality = ?, address_text = ?, notes = ?, updated_at = ?, updated_by = ?',
    [input.displayName.trim(), clean(input.locality), clean(input.addressText), clean(input.notes)],
    actor,
    'CLIENT',
    'CLIENT_UPDATED',
    ['display_name', 'locality', 'address_text', 'notes'],
  );
}

export async function listClients(db: OperationsDb, search = '') {
  const q = `%${search.trim().slice(0, 120)}%`;
  const result = await db
    .prepare(
      'SELECT id, display_name, locality, updated_at, record_version FROM clients WHERE archived_at IS NULL AND (display_name LIKE ? OR locality LIKE ?) ORDER BY updated_at DESC LIMIT 100',
    )
    .bind(q, q)
    .all();
  return result.results ?? [];
}

export async function createHolding(db: OperationsDb, input: HoldingInput, actor: M14Actor) {
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO holdings (id, created_at, updated_at, display_name, primary_client_id, locality, address_text, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      now,
      now,
      clean(input.displayName),
      clean(input.primaryClientId),
      input.locality.trim(),
      clean(input.addressText),
      clean(input.notes),
      actor.actor,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'HOLDING', id, 'HOLDING_CREATED', [
    'display_name',
    'primary_client_id',
    'locality',
  ]);
  return id;
}

export async function listHoldings(db: OperationsDb, search = '') {
  const q = `%${search.trim().slice(0, 120)}%`;
  const result = await db
    .prepare(
      'SELECT h.id, h.display_name, h.locality, c.display_name AS client_name, h.updated_at, h.record_version FROM holdings h LEFT JOIN clients c ON c.id = h.primary_client_id WHERE h.archived_at IS NULL AND (h.display_name LIKE ? OR h.locality LIKE ? OR c.display_name LIKE ?) ORDER BY h.updated_at DESC LIMIT 100',
    )
    .bind(q, q, q)
    .all();
  return result.results ?? [];
}

export async function updateHolding(
  db: OperationsDb,
  id: string,
  input: HoldingInput,
  version: number,
  actor: M14Actor,
) {
  return updateVersioned(
    db,
    'holdings',
    id,
    version,
    'display_name = ?, primary_client_id = ?, locality = ?, address_text = ?, notes = ?, updated_at = ?, updated_by = ?',
    [
      clean(input.displayName),
      clean(input.primaryClientId),
      input.locality.trim(),
      clean(input.addressText),
      clean(input.notes),
    ],
    actor,
    'HOLDING',
    'HOLDING_UPDATED',
    ['display_name', 'primary_client_id', 'locality', 'address_text', 'notes'],
  );
}

export async function createAnimal(db: OperationsDb, input: AnimalInput, actor: M14Actor) {
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO animals (id, created_at, updated_at, domain, client_id, holding_id, name, identifier, species_code, species_text, breed, sex, reproductive_status, birth_date, age_text, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      now,
      now,
      input.domain,
      clean(input.clientId),
      clean(input.holdingId),
      clean(input.name),
      clean(input.identifier),
      input.speciesCode.trim(),
      clean(input.speciesText),
      clean(input.breed),
      input.sex ?? 'UNKNOWN',
      clean(input.reproductiveStatus),
      clean(input.birthDate),
      clean(input.ageText),
      clean(input.notes),
      actor.actor,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'ANIMAL', id, 'ANIMAL_CREATED', [
    'domain',
    'client_id',
    'holding_id',
    'name',
    'identifier',
    'species_code',
  ]);
  return id;
}

export async function listAnimals(db: OperationsDb, search = '', holdingId?: string) {
  const q = `%${search.trim().slice(0, 120)}%`;
  const result = await db
    .prepare(
      "SELECT a.id, a.domain, a.name, a.identifier, a.species_code, a.sex, a.holding_id, a.client_id, a.updated_at, a.record_version FROM animals a WHERE a.archived_at IS NULL AND (? = '' OR a.holding_id = ?) AND (a.name LIKE ? OR a.identifier LIKE ? OR a.species_code LIKE ?) ORDER BY a.updated_at DESC LIMIT 100",
    )
    .bind(holdingId ?? '', holdingId ?? '', q, q, q)
    .all();
  return result.results ?? [];
}

export async function updateAnimal(
  db: OperationsDb,
  id: string,
  input: AnimalInput,
  version: number,
  actor: M14Actor,
) {
  return updateVersioned(
    db,
    'animals',
    id,
    version,
    'domain = ?, client_id = ?, holding_id = ?, name = ?, identifier = ?, species_code = ?, species_text = ?, breed = ?, sex = ?, reproductive_status = ?, birth_date = ?, age_text = ?, notes = ?, updated_at = ?, updated_by = ?',
    [
      input.domain,
      clean(input.clientId),
      clean(input.holdingId),
      clean(input.name),
      clean(input.identifier),
      input.speciesCode.trim(),
      clean(input.speciesText),
      clean(input.breed),
      input.sex ?? 'UNKNOWN',
      clean(input.reproductiveStatus),
      clean(input.birthDate),
      clean(input.ageText),
      clean(input.notes),
    ],
    actor,
    'ANIMAL',
    'ANIMAL_UPDATED',
    ['domain', 'client_id', 'holding_id', 'name', 'identifier', 'species_code', 'sex', 'notes'],
  );
}

export async function createAnimalGroup(
  db: OperationsDb,
  input: AnimalGroupInput,
  actor: M14Actor,
) {
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO animal_groups (id, created_at, updated_at, holding_id, display_name, species_code, species_text, approx_count, age_description, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      now,
      now,
      input.holdingId,
      input.displayName.trim(),
      input.speciesCode.trim(),
      clean(input.speciesText),
      input.approxCount ?? null,
      clean(input.ageDescription),
      clean(input.notes),
      actor.actor,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'ANIMAL_GROUP', id, 'ANIMAL_GROUP_CREATED', [
    'holding_id',
    'display_name',
    'species_code',
    'approx_count',
  ]);
  return id;
}

export async function listAnimalGroups(db: OperationsDb, holdingId?: string) {
  const result = holdingId
    ? await db
        .prepare(
          'SELECT id, holding_id, display_name, species_code, approx_count, updated_at, record_version FROM animal_groups WHERE archived_at IS NULL AND holding_id = ? ORDER BY display_name',
        )
        .bind(holdingId)
        .all()
    : await db
        .prepare(
          'SELECT id, holding_id, display_name, species_code, approx_count, updated_at, record_version FROM animal_groups WHERE archived_at IS NULL ORDER BY updated_at DESC LIMIT 100',
        )
        .all();
  return result.results ?? [];
}

export async function updateAnimalGroup(
  db: OperationsDb,
  id: string,
  input: AnimalGroupInput,
  version: number,
  actor: M14Actor,
) {
  return updateVersioned(
    db,
    'animal_groups',
    id,
    version,
    'holding_id = ?, display_name = ?, species_code = ?, species_text = ?, approx_count = ?, age_description = ?, notes = ?, updated_at = ?, updated_by = ?',
    [
      input.holdingId,
      input.displayName.trim(),
      input.speciesCode.trim(),
      clean(input.speciesText),
      input.approxCount ?? null,
      clean(input.ageDescription),
      clean(input.notes),
    ],
    actor,
    'ANIMAL_GROUP',
    'ANIMAL_GROUP_UPDATED',
    ['holding_id', 'display_name', 'species_code', 'approx_count', 'notes'],
  );
}

async function subjectExists(
  db: OperationsDb,
  input: { animalId?: string; animalGroupId?: string; holdingId?: string },
) {
  const keys = ['animalId', 'animalGroupId', 'holdingId'].filter(
    (key) => input[key as keyof typeof input],
  );
  if (keys.length !== 1) return false;
  const table =
    keys[0] === 'animalId' ? 'animals' : keys[0] === 'animalGroupId' ? 'animal_groups' : 'holdings';
  const id = input[keys[0] as keyof typeof input];
  return Boolean(
    await db
      .prepare(`SELECT id FROM ${table} WHERE id = ? AND archived_at IS NULL`)
      .bind(id)
      .first<{ id: string }>(),
  );
}

export async function createEncounter(db: OperationsDb, input: EncounterInput, actor: M14Actor) {
  if (!(await subjectExists(db, input))) return { ok: false as const, error: 'subject_not_found' };
  const id = createOpaqueId();
  const now = iso();
  const encounterStatement = db
    .prepare(
      "INSERT INTO encounters (id, created_at, updated_at, started_at, encounter_type, status, source, source_inquiry_id, animal_id, animal_group_id, holding_id, presenting_problem, history, examination_text, assessment, plan, outcome_text, created_by, updated_by) VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      now,
      now,
      now,
      input.encounterType,
      input.source ?? 'MANUAL',
      clean(input.sourceInquiryId),
      clean(input.animalId),
      clean(input.animalGroupId),
      clean(input.holdingId),
      clean(input.presentingProblem),
      clean(input.history),
      clean(input.examinationText),
      clean(input.assessment),
      clean(input.plan),
      clean(input.outcomeText),
      actor.actor,
      actor.actor,
    );
  const clinicalStatement = db
    .prepare(
      'INSERT INTO clinical_records (id, encounter_id, presenting_problem, history, examination_text, assessment, plan, outcome_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      createOpaqueId(),
      id,
      clean(input.presentingProblem),
      clean(input.history),
      clean(input.examinationText),
      clean(input.assessment),
      clean(input.plan),
      clean(input.outcomeText),
      now,
      now,
    );
  if (db.batch) await db.batch([encounterStatement, clinicalStatement]);
  else {
    await encounterStatement.run();
    await clinicalStatement.run();
  }
  if (input.vitals) await saveVitals(db, id, input.vitals, actor);
  if (input.populationCounts) await savePopulationCounts(db, id, input.populationCounts, actor);
  await audit(db, actor, 'ENCOUNTER', id, 'ENCOUNTER_CREATED', ['encounter_type', 'subject']);
  return { ok: true as const, id };
}

export async function updateEncounter(
  db: OperationsDb,
  id: string,
  input: Partial<EncounterInput>,
  version: number,
  actor: M14Actor,
) {
  const fields = [
    'presentingProblem',
    'history',
    'examinationText',
    'assessment',
    'plan',
    'outcomeText',
  ].filter((key) => key in input);
  if (!fields.length) return { ok: true as const };
  const map: Record<string, string> = {
    presentingProblem: 'presenting_problem',
    history: 'history',
    examinationText: 'examination_text',
    assessment: 'assessment',
    plan: 'plan',
    outcomeText: 'outcome_text',
  };
  const assignments = fields.map((field) => `${map[field]} = ?`).join(', ');
  const values = fields.map((field) =>
    clean(input[field as keyof EncounterInput] as string | undefined),
  );
  if (!Number.isInteger(version) || version < 1) return { ok: false as const, error: 'validation' };
  const now = iso();
  if (db.batch) {
    const results = await db.batch([
      db
        .prepare(
          `UPDATE encounters SET ${assignments}, updated_at = ?, updated_by = ?, record_version = record_version + 1 WHERE id = ? AND record_version = ? AND EXISTS (SELECT 1 FROM clinical_records WHERE encounter_id = ? AND record_version = ?)`,
        )
        .bind(...values, now, actor.actor, id, version, id, version),
      db
        .prepare(
          `UPDATE clinical_records SET ${assignments}, updated_at = ?, record_version = record_version + 1 WHERE encounter_id = ? AND record_version = ?`,
        )
        .bind(...values, now, id, version),
    ]);
    const changed = results.map((result) =>
      Number((result as { meta?: { changes?: number } }).meta?.changes ?? 0),
    );
    if (changed[0] !== 1 || changed[1] !== 1) {
      await audit(db, actor, 'ENCOUNTER', id, 'ENCOUNTER_UPDATED', fields, 'CONFLICT');
      return { ok: false as const, error: 'conflict' };
    }
    await audit(db, actor, 'ENCOUNTER', id, 'ENCOUNTER_UPDATED', fields);
    return { ok: true as const };
  }
  return updateVersioned(
    db,
    'encounters',
    id,
    version,
    `${assignments}, updated_at = ?, updated_by = ?`,
    values,
    actor,
    'ENCOUNTER',
    'ENCOUNTER_UPDATED',
    fields,
  );
}

export async function completeEncounter(
  db: OperationsDb,
  id: string,
  version: number,
  actor: M14Actor,
) {
  const current = await db
    .prepare('SELECT status FROM encounters WHERE id = ?')
    .bind(id)
    .first<{ status: string }>();
  if (!current) return { ok: false as const, error: 'not_found' };
  if (current.status !== 'DRAFT') return { ok: false as const, error: 'already_completed' };
  const result = await updateVersioned(
    db,
    'encounters',
    id,
    version,
    "status = 'COMPLETED', completed_at = ?, updated_at = ?, updated_by = ?",
    [iso()],
    actor,
    'ENCOUNTER',
    'ENCOUNTER_COMPLETED',
    [],
  );
  return result;
}

export async function saveVitals(
  db: OperationsDb,
  encounterId: string,
  input: NonNullable<EncounterInput['vitals']>,
  actor: M14Actor,
) {
  const now = input.observedAt ?? iso();
  await db
    .prepare(
      'INSERT INTO encounter_vitals (id, encounter_id, observed_at, weight_kg, temperature_c, heart_rate_bpm, respiratory_rate_per_min, hydration, mucous_membranes, crt_seconds, pain, observations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(encounter_id) DO UPDATE SET observed_at = excluded.observed_at, weight_kg = excluded.weight_kg, temperature_c = excluded.temperature_c, heart_rate_bpm = excluded.heart_rate_bpm, respiratory_rate_per_min = excluded.respiratory_rate_per_min, hydration = excluded.hydration, mucous_membranes = excluded.mucous_membranes, crt_seconds = excluded.crt_seconds, pain = excluded.pain, observations = excluded.observations',
    )
    .bind(
      createOpaqueId(),
      encounterId,
      now,
      input.weightKg ?? null,
      input.temperatureC ?? null,
      input.heartRateBpm ?? null,
      input.respiratoryRatePerMin ?? null,
      clean(input.hydration),
      clean(input.mucousMembranes),
      input.crtSeconds ?? null,
      clean(input.pain),
      clean(input.observations),
    )
    .run();
  await audit(db, actor, 'ENCOUNTER', encounterId, 'ENCOUNTER_UPDATED', ['vitals']);
  return { ok: true as const };
}

export async function savePopulationCounts(
  db: OperationsDb,
  encounterId: string,
  input: NonNullable<EncounterInput['populationCounts']>,
  actor: M14Actor,
) {
  await db
    .prepare(
      'INSERT INTO encounter_population_counts (id, encounter_id, population_count, examined_count, affected_count, treated_count) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(encounter_id) DO UPDATE SET population_count = excluded.population_count, examined_count = excluded.examined_count, affected_count = excluded.affected_count, treated_count = excluded.treated_count',
    )
    .bind(
      createOpaqueId(),
      encounterId,
      input.populationCount ?? null,
      input.examinedCount ?? null,
      input.affectedCount ?? null,
      input.treatedCount ?? null,
    )
    .run();
  await audit(db, actor, 'ENCOUNTER', encounterId, 'ENCOUNTER_UPDATED', ['population_counts']);
  return { ok: true as const };
}

async function encounterExists(db: OperationsDb, id: string) {
  return Boolean(
    await db.prepare('SELECT id FROM encounters WHERE id = ?').bind(id).first<{ id: string }>(),
  );
}

async function encounterHasSubject(
  db: OperationsDb,
  encounterId: string,
  input: { animalId?: string; animalGroupId?: string; holdingId?: string },
) {
  const encounter = await db
    .prepare('SELECT animal_id, animal_group_id, holding_id FROM encounters WHERE id = ?')
    .bind(encounterId)
    .first<{ animal_id?: string; animal_group_id?: string; holding_id?: string }>();
  if (!encounter) return { exists: false, matches: false };
  return {
    exists: true,
    matches: Boolean(
      (encounter.animal_id && input.animalId === encounter.animal_id) ||
      (encounter.animal_group_id && input.animalGroupId === encounter.animal_group_id) ||
      (encounter.holding_id && input.holdingId === encounter.holding_id),
    ),
  };
}

export async function addDiagnosis(
  db: OperationsDb,
  encounterId: string,
  input: DiagnosisInput,
  actor: M14Actor,
) {
  if (!(await encounterExists(db, encounterId))) return { ok: false as const, error: 'not_found' };
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO diagnoses (id, encounter_id, type, label, notes, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      encounterId,
      input.type,
      input.label.trim(),
      clean(input.notes),
      now,
      now,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'DIAGNOSIS', id, 'DIAGNOSIS_ADDED', ['type', 'label', 'notes']);
  return { ok: true as const, id };
}

export async function updateDiagnosis(
  db: OperationsDb,
  id: string,
  input: DiagnosisInput,
  version: number,
  actor: M14Actor,
) {
  if (!Number.isInteger(version) || version < 1) return { ok: false as const, error: 'validation' };
  const result = await db
    .prepare(
      'UPDATE diagnoses SET type = ?, label = ?, notes = ?, updated_at = ?, record_version = record_version + 1 WHERE id = ? AND record_version = ?',
    )
    .bind(input.type, input.label.trim(), clean(input.notes), iso(), id, version)
    .run();
  const changed = Number((result as { meta?: { changes?: number } }).meta?.changes ?? 0);
  if (changed !== 1) {
    await audit(
      db,
      actor,
      'DIAGNOSIS',
      id,
      'DIAGNOSIS_UPDATED',
      ['type', 'label', 'notes'],
      'CONFLICT',
    );
    return { ok: false as const, error: 'conflict' };
  }
  await audit(db, actor, 'DIAGNOSIS', id, 'DIAGNOSIS_UPDATED', ['type', 'label', 'notes']);
  return { ok: true as const };
}

export async function addMedication(
  db: OperationsDb,
  encounterId: string,
  input: MedicationInput,
  actor: M14Actor,
) {
  if (!(await encounterExists(db, encounterId))) return { ok: false as const, error: 'not_found' };
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO medication_records (id, encounter_id, drug_name, active_ingredient, dose_value, dose_unit, dose_basis, route, frequency, duration, instructions, dose_text, administration_type, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      encounterId,
      clean(input.drugName),
      clean(input.activeIngredient),
      input.doseValue ?? null,
      clean(input.doseUnit),
      clean(input.doseBasis),
      clean(input.route),
      clean(input.frequency),
      clean(input.duration),
      clean(input.instructions),
      clean(input.doseText),
      input.administrationType,
      now,
      now,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'MEDICATION', id, 'MEDICATION_ADDED', [
    'drug_name',
    'dose_value',
    'dose_unit',
    'administration_type',
  ]);
  return { ok: true as const, id };
}

export async function addProcedure(
  db: OperationsDb,
  encounterId: string,
  input: ProcedureInput,
  actor: M14Actor,
) {
  if (!(await encounterExists(db, encounterId))) return { ok: false as const, error: 'not_found' };
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO procedures (id, encounter_id, type, label, notes, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      encounterId,
      input.type,
      clean(input.label),
      clean(input.notes),
      now,
      now,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'PROCEDURE', id, 'PROCEDURE_ADDED', ['type', 'label', 'notes']);
  return { ok: true as const, id };
}

export async function recordVaccination(
  db: OperationsDb,
  input: VaccinationInput,
  actor: M14Actor,
) {
  if (!(await subjectExists(db, input))) return { ok: false as const, error: 'subject_not_found' };
  if (input.encounterId) {
    const subject = await encounterHasSubject(db, input.encounterId, input);
    if (!subject.exists) return { ok: false as const, error: 'not_found' };
    if (!subject.matches) return { ok: false as const, error: 'subject_mismatch' };
  }
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO vaccinations (id, encounter_id, animal_id, animal_group_id, date, vaccine_name, manufacturer, batch_lot, route, next_due_at, notes, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      clean(input.encounterId),
      clean(input.animalId),
      clean(input.animalGroupId),
      input.date,
      input.vaccineName.trim(),
      clean(input.manufacturer),
      clean(input.batchLot),
      clean(input.route),
      clean(input.nextDueAt),
      clean(input.notes),
      now,
      now,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'VACCINATION', id, 'VACCINATION_RECORDED', [
    'date',
    'vaccine_name',
    'next_due_at',
  ]);
  return { ok: true as const, id };
}

export async function createFollowUp(db: OperationsDb, input: FollowUpInput, actor: M14Actor) {
  if (!(await encounterExists(db, input.encounterId)) || !(await subjectExists(db, input)))
    return { ok: false as const, error: 'subject_not_found' };
  const subject = await encounterHasSubject(db, input.encounterId, input);
  if (!subject.matches) return { ok: false as const, error: 'subject_mismatch' };
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO clinical_followups (id, encounter_id, animal_id, animal_group_id, holding_id, due_at, reason, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      input.encounterId,
      clean(input.animalId),
      clean(input.animalGroupId),
      clean(input.holdingId),
      input.dueAt,
      input.reason.trim(),
      now,
      now,
    )
    .run();
  await audit(db, actor, 'FOLLOWUP', id, 'FOLLOWUP_CREATED', ['due_at', 'reason']);
  return { ok: true as const, id };
}

export async function addPatientAlert(db: OperationsDb, input: PatientAlertInput, actor: M14Actor) {
  if (
    !(await db
      .prepare('SELECT id FROM animals WHERE id = ?')
      .bind(input.animalId)
      .first<{ id: string }>())
  )
    return { ok: false as const, error: 'not_found' };
  const id = createOpaqueId();
  const now = iso();
  await db
    .prepare(
      'INSERT INTO patient_alerts (id, animal_id, type, short_label, notes, created_at, updated_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      id,
      input.animalId,
      input.type,
      input.shortLabel.trim(),
      clean(input.notes),
      now,
      now,
      actor.actor,
    )
    .run();
  await audit(db, actor, 'PATIENT_ALERT', id, 'PATIENT_ALERT_ADDED', [
    'type',
    'short_label',
    'notes',
  ]);
  return { ok: true as const, id };
}

export async function getEncounter(db: OperationsDb, id: string) {
  const encounter = await db
    .prepare('SELECT * FROM encounters WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();
  if (!encounter) return null;
  const [
    clinical,
    vitals,
    counts,
    diagnoses,
    medications,
    procedures,
    vaccinations,
    followups,
    auditEvents,
  ] = await Promise.all([
    db.prepare('SELECT * FROM clinical_records WHERE encounter_id = ?').bind(id).first(),
    db.prepare('SELECT * FROM encounter_vitals WHERE encounter_id = ?').bind(id).first(),
    db.prepare('SELECT * FROM encounter_population_counts WHERE encounter_id = ?').bind(id).first(),
    db
      .prepare('SELECT * FROM diagnoses WHERE encounter_id = ? ORDER BY created_at DESC')
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM medication_records WHERE encounter_id = ? ORDER BY created_at DESC')
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM procedures WHERE encounter_id = ? ORDER BY created_at DESC')
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM vaccinations WHERE encounter_id = ? ORDER BY date DESC')
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM clinical_followups WHERE encounter_id = ? ORDER BY due_at')
      .bind(id)
      .all(),
    db
      .prepare(
        'SELECT created_at, actor, entity_type, action, changed_fields, result FROM audit_events WHERE entity_id = ? ORDER BY created_at DESC',
      )
      .bind(id)
      .all(),
  ]);
  return {
    encounter,
    clinical,
    vitals,
    counts,
    diagnoses: diagnoses.results ?? [],
    medications: medications.results ?? [],
    procedures: procedures.results ?? [],
    vaccinations: vaccinations.results ?? [],
    followups: followups.results ?? [],
    audit: auditEvents.results ?? [],
  };
}

export async function getPatient(db: OperationsDb, id: string) {
  const animal = await db
    .prepare(
      'SELECT a.*, c.display_name AS client_name, h.display_name AS holding_name FROM animals a LEFT JOIN clients c ON c.id = a.client_id LEFT JOIN holdings h ON h.id = a.holding_id WHERE a.id = ?',
    )
    .bind(id)
    .first<Record<string, unknown>>();
  if (!animal) return null;
  const [alerts, encounters, vaccinations, followups] = await Promise.all([
    db
      .prepare(
        'SELECT * FROM patient_alerts WHERE animal_id = ? AND active = 1 ORDER BY created_at DESC',
      )
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM encounters WHERE animal_id = ? ORDER BY started_at DESC LIMIT 30')
      .bind(id)
      .all(),
    db
      .prepare('SELECT * FROM vaccinations WHERE animal_id = ? ORDER BY date DESC LIMIT 30')
      .bind(id)
      .all(),
    db
      .prepare(
        "SELECT * FROM clinical_followups WHERE animal_id = ? AND status = 'OPEN' ORDER BY due_at",
      )
      .bind(id)
      .all(),
  ]);
  return {
    animal,
    alerts: alerts.results ?? [],
    encounters: encounters.results ?? [],
    vaccinations: vaccinations.results ?? [],
    followups: followups.results ?? [],
  };
}

export async function getHolding(db: OperationsDb, id: string) {
  const holding = await db
    .prepare(
      'SELECT h.*, c.display_name AS client_name FROM holdings h LEFT JOIN clients c ON c.id = h.primary_client_id WHERE h.id = ?',
    )
    .bind(id)
    .first<Record<string, unknown>>();
  if (!holding) return null;
  const [groups, animals, encounters, followups] = await Promise.all([
    listAnimalGroups(db, id),
    listAnimals(db, '', id),
    db
      .prepare(
        'SELECT * FROM encounters WHERE holding_id = ? OR animal_group_id IN (SELECT id FROM animal_groups WHERE holding_id = ?) OR animal_id IN (SELECT id FROM animals WHERE holding_id = ?) ORDER BY started_at DESC LIMIT 30',
      )
      .bind(id, id, id)
      .all(),
    db
      .prepare(
        'SELECT * FROM clinical_followups WHERE holding_id = ? OR animal_group_id IN (SELECT id FROM animal_groups WHERE holding_id = ?) OR animal_id IN (SELECT id FROM animals WHERE holding_id = ?) ORDER BY due_at',
      )
      .bind(id, id, id)
      .all(),
  ]);
  return {
    holding,
    groups,
    animals,
    encounters: encounters.results ?? [],
    followups: followups.results ?? [],
  };
}

export async function searchM14(db: OperationsDb, query: string) {
  const q = `%${query.trim().slice(0, 120)}%`;
  const results = await Promise.all([
    db
      .prepare(
        "SELECT 'CLIENT' AS entity_type, id, display_name AS label, locality AS detail FROM clients WHERE archived_at IS NULL AND (display_name LIKE ? OR locality LIKE ?) LIMIT 100",
      )
      .bind(q, q)
      .all(),
    db
      .prepare(
        "SELECT 'ANIMAL' AS entity_type, id, COALESCE(name, species_code) AS label, COALESCE(identifier, domain) AS detail FROM animals WHERE archived_at IS NULL AND (name LIKE ? OR identifier LIKE ? OR species_code LIKE ?) LIMIT 100",
      )
      .bind(q, q, q)
      .all(),
    db
      .prepare(
        "SELECT 'HOLDING' AS entity_type, id, COALESCE(display_name, locality) AS label, locality AS detail FROM holdings WHERE archived_at IS NULL AND (display_name LIKE ? OR locality LIKE ?) LIMIT 100",
      )
      .bind(q, q)
      .all(),
    db
      .prepare(
        "SELECT 'ANIMAL_GROUP' AS entity_type, id, display_name AS label, species_code AS detail FROM animal_groups WHERE archived_at IS NULL AND display_name LIKE ? LIMIT 100",
      )
      .bind(q)
      .all(),
    db
      .prepare(
        "SELECT 'ENCOUNTER' AS entity_type, id, encounter_type AS label, started_at AS detail FROM encounters WHERE id LIKE ? LIMIT 100",
      )
      .bind(q)
      .all(),
    db
      .prepare(
        "SELECT 'INQUIRY' AS entity_type, id, public_ref AS label, domain AS detail FROM inquiries WHERE public_ref LIKE ? LIMIT 100",
      )
      .bind(q)
      .all(),
  ]);
  return results.flatMap((result) => result.results ?? []).slice(0, 100);
}
