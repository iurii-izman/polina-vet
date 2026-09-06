import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  validateAnimalGroupInput,
  validateAnimalInput,
  validateClientInput,
  validateClinicalChild,
  validateEncounterInput,
  validateEncounterUpdateInput,
  validateHoldingInput,
} from './domain.ts';

const actor = {
  actor: 'synthetic-operator',
  role: 'TECH_ADMIN' as const,
  requestId: 'request-test',
};

test('M14 migration is additive and keeps Inquiry source nullable', async () => {
  const migration = await readFile(
    fileURLToPath(
      new URL('../../../apps/intake/migrations/0002_m14_core/migration.sql', import.meta.url),
    ),
    'utf8',
  );
  for (const table of [
    'clients',
    'client_contacts',
    'holdings',
    'animals',
    'animal_groups',
    'encounters',
    'clinical_records',
    'diagnoses',
    'medication_records',
    'procedures',
    'vaccinations',
    'clinical_followups',
    'patient_alerts',
    'audit_events',
  ])
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(migration, /source_inquiry_id TEXT REFERENCES inquiries\(id\) ON DELETE SET NULL/);
  assert.doesNotMatch(migration, /DROP TABLE|DELETE FROM inquiries|PUBLIC_INTAKE_ENABLED/);
});

test('client, holding, pet, and farm group validation is practical and bounded', () => {
  assert.equal(
    validateClientInput({
      displayName: 'Синтетический владелец',
      contacts: [{ type: 'PHONE', value: '+37360000000', isPrimary: true }],
    }).ok,
    true,
  );
  assert.equal(validateHoldingInput({ locality: 'Синтетический район' }).ok, true);
  assert.equal(validateAnimalInput({ domain: 'PET', speciesCode: 'cat', name: 'Барсик' }).ok, true);
  assert.equal(validateAnimalInput({ domain: 'FARM', speciesCode: 'cattle' }).ok, false);
  assert.equal(
    validateAnimalGroupInput({
      holdingId: 'holding-1',
      displayName: 'Телята',
      speciesCode: 'cattle',
      approxCount: 12,
    }).ok,
    true,
  );
});

test('encounter validation requires one typed subject and does not medically interpret text', () => {
  assert.equal(
    validateEncounterInput({
      encounterType: 'AT_SITE',
      animalId: 'animal-1',
      presentingProblem: 'Synthetic clinical text',
    }).ok,
    true,
  );
  assert.equal(
    validateEncounterInput({
      encounterType: 'FIELD_VISIT',
      animalId: 'animal-1',
      holdingId: 'holding-1',
    }).ok,
    false,
  );
  assert.equal(
    validateEncounterInput({
      encounterType: 'REMOTE',
      holdingId: 'holding-1',
      assessment: 'Any clinician decision remains free text.',
    }).ok,
    true,
  );
});

test('encounter updates keep clinical text bounded and reject empty patches', () => {
  assert.equal(validateEncounterUpdateInput({ outcomeText: 'Synthetic correction' }).ok, true);
  assert.equal(validateEncounterUpdateInput({}).ok, false);
  assert.equal(validateEncounterUpdateInput({ plan: 'x'.repeat(8001) }).ok, false);
});

test('encounter nested measurements are typed and bounded', () => {
  assert.equal(
    validateEncounterInput({
      encounterType: 'AT_SITE',
      animalId: 'animal-1',
      vitals: { weightKg: 12.5, temperatureC: 38.2 },
      populationCounts: { populationCount: 12, examinedCount: 4 },
    }).ok,
    true,
  );
  assert.equal(
    validateEncounterInput({
      encounterType: 'AT_SITE',
      animalId: 'animal-1',
      vitals: { weightKg: '12.5' },
    }).ok,
    false,
  );
  assert.equal(
    validateEncounterInput({
      encounterType: 'FIELD_VISIT',
      animalGroupId: 'group-1',
      populationCounts: { treatedCount: -1 },
    }).ok,
    false,
  );
});

test('medication keeps the free-text path available without dose inference', () => {
  const result = validateClinicalChild('medication', {
    administrationType: 'PRESCRIBED',
    doseText: 'Synthetic practical instruction',
  });
  assert.equal(result.ok, true);
  assert.equal(validateClinicalChild('medication', { administrationType: 'PRESCRIBED' }).ok, false);
});

test('audit actor shape has no clinical payload fields', () => {
  assert.deepEqual(Object.keys(actor).sort(), ['actor', 'requestId', 'role']);
});
