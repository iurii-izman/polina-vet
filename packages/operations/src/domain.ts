export const locales = ['ru', 'ro', 'uk'] as const;
export type Locale = (typeof locales)[number];

export const domains = ['PET', 'FARM'] as const;
export type InquiryDomain = (typeof domains)[number];

export const statuses = ['NEW', 'IN_PROGRESS', 'WAITING', 'FOLLOW_UP', 'CLOSED'] as const;
export type InquiryStatus = (typeof statuses)[number];

export const outcomes = [
  'visit_at_site',
  'field_visit',
  'advice_given',
  'follow_up_completed',
  'no_response',
  'declined',
  'duplicate',
  'spam',
  'other',
] as const;
export type InquiryOutcome = (typeof outcomes)[number];

export const publicContactChannels = ['phone', 'telegram'] as const;
export const officeContactChannels = [
  'phone',
  'telegram',
  'viber',
  'whatsapp',
  'instagram',
  'facebook',
  'in_person',
  'other',
] as const;
export type ContactChannel = (typeof officeContactChannels)[number];

export const acquisitionSources = [
  'website',
  'google',
  'telegram',
  'instagram',
  'facebook',
  'recommendation',
  'offline',
  'other',
  'unknown',
] as const;
export type AcquisitionSource = (typeof acquisitionSources)[number];

export const intakeSources = ['web_form', 'manual'] as const;
export const officeSources = [
  'phone',
  'telegram',
  'viber',
  'whatsapp',
  'instagram',
  'facebook',
  'in_person',
  'other',
] as const;
export type InquirySource = (typeof intakeSources)[number] | (typeof officeSources)[number];

export const petSpecies = ['dog', 'cat', 'other'] as const;
export const farmSpecies = ['cattle', 'sheep_goats', 'pigs', 'horse', 'poultry', 'other'] as const;
export const petReasons = [
  'sick',
  'injury',
  'vaccination_prevention',
  'parasites',
  'follow_up',
  'other',
] as const;
export const farmReasons = [
  'sick',
  'prevention',
  'vaccination_treatment',
  'youngstock',
  'reproduction',
  'other',
] as const;
export const groupScopes = ['single', 'multiple'] as const;

export type InquiryRecord = {
  id: string;
  public_ref: string;
  created_at: string;
  updated_at: string;
  locale: Locale;
  domain: InquiryDomain;
  source: string;
  acquisition_source: AcquisitionSource;
  contact_channel: ContactChannel;
  preferred_contact_channel: ContactChannel;
  person_name: string;
  contact_value: string;
  locality: string;
  address: string | null;
  species: string;
  species_other: string | null;
  group_scope: string | null;
  affected_count: number | null;
  reason: string;
  onset: string | null;
  summary: string;
  status: InquiryStatus;
  outcome: InquiryOutcome | null;
  assigned_to: string | null;
  follow_up_at: string | null;
  last_contact_at: string | null;
  closed_at: string | null;
  privacy_notice_version: string | null;
  privacy_notice_acknowledged_at: string | null;
  retention_until: string | null;
};

export type PublicInquiryInput = {
  locale: Locale;
  domain: InquiryDomain;
  preferredContactChannel: ContactChannel;
  personName: string;
  contactValue: string;
  locality: string;
  address?: string;
  species: string;
  speciesOther?: string;
  groupScope?: string;
  affectedCount?: number;
  reason: string;
  onset?: string;
  summary: string;
  acquisitionSource?: AcquisitionSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  privacyNoticeVersion: string;
  privacyAcknowledged: boolean;
};

export type OfficeInquiryInput = Omit<
  PublicInquiryInput,
  'privacyNoticeVersion' | 'privacyAcknowledged'
> & {
  source: string;
  acquisitionSource?: AcquisitionSource;
  contactChannel?: ContactChannel;
};

export type ValidationIssue = { field: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const oneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === 'string' && values.includes(value as T);
const max = (value: string, length: number) => value.length <= length;

export function normalizeContact(channel: ContactChannel, value: string): string {
  const clean = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (channel === 'phone') return clean.replace(/[()\s-]+/g, '');
  if (channel === 'telegram') return clean.replace(/^https?:\/\/t\.me\//i, '@').replace(/^@?/, '@');
  return clean;
}

function baseIssues(input: Record<string, unknown>, known: readonly string[]): ValidationIssue[] {
  return Object.keys(input)
    .filter((key) => !known.includes(key))
    .map((field) => ({ field, message: 'Unknown field' }));
}

export function validatePublicInquiry(
  input: unknown,
  privacyVersion: string,
): ValidationResult<PublicInquiryInput> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return { ok: false, issues: [{ field: 'body', message: 'Object required' }] };
  const value = input as Record<string, unknown>;
  const known = [
    'locale',
    'domain',
    'preferredContactChannel',
    'personName',
    'contactValue',
    'locality',
    'address',
    'species',
    'speciesOther',
    'groupScope',
    'affectedCount',
    'reason',
    'onset',
    'summary',
    'acquisitionSource',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'utmContent',
    'privacyNoticeVersion',
    'privacyAcknowledged',
  ];
  const issues = baseIssues(value, known);
  const locale = value.locale;
  const domain = value.domain;
  const channel = value.preferredContactChannel;
  const personName = text(value.personName);
  const contactValue = text(value.contactValue);
  const locality = text(value.locality);
  const address = text(value.address);
  const species = text(value.species);
  const speciesOther = text(value.speciesOther);
  const groupScope = text(value.groupScope);
  const onset = text(value.onset);
  const reason = text(value.reason);
  const summary = text(value.summary);
  if (!oneOf(locale, locales)) issues.push({ field: 'locale', message: 'Unsupported locale' });
  if (!oneOf(domain, domains)) issues.push({ field: 'domain', message: 'Unsupported domain' });
  if (!oneOf(channel, publicContactChannels))
    issues.push({ field: 'preferredContactChannel', message: 'Unsupported contact channel' });
  if (!personName || !max(personName, 120))
    issues.push({
      field: 'personName',
      message: 'Name is required and must be at most 120 characters',
    });
  if (!contactValue || !max(contactValue, 160))
    issues.push({
      field: 'contactValue',
      message: 'Contact is required and must be at most 160 characters',
    });
  if (!locality || !max(locality, 120))
    issues.push({
      field: 'locality',
      message: 'Locality is required and must be at most 120 characters',
    });
  if (!max(address, 250)) issues.push({ field: 'address', message: 'Address is too long' });
  if (!species || !max(species, 40))
    issues.push({ field: 'species', message: 'Species is required' });
  if (oneOf(domain, domains) && !oneOf(species, domain === 'PET' ? petSpecies : farmSpecies))
    issues.push({ field: 'species', message: 'Species is not available for this context' });
  if (!max(speciesOther, 80))
    issues.push({ field: 'speciesOther', message: 'Species is too long' });
  if (!oneOf(domain, domains) || (domain === 'FARM' && !oneOf(groupScope, groupScopes))) {
    if (domain === 'FARM')
      issues.push({ field: 'groupScope', message: 'Group scope is required for farm inquiries' });
  }
  if (
    value.affectedCount !== undefined &&
    (!Number.isInteger(value.affectedCount) ||
      Number(value.affectedCount) < 1 ||
      Number(value.affectedCount) > 1000000)
  )
    issues.push({ field: 'affectedCount', message: 'Affected count is invalid' });
  if (!reason || !max(reason, 60)) issues.push({ field: 'reason', message: 'Reason is required' });
  if (oneOf(domain, domains) && !oneOf(reason, domain === 'PET' ? petReasons : farmReasons))
    issues.push({ field: 'reason', message: 'Reason is not available for this context' });
  if (!max(onset, 120)) issues.push({ field: 'onset', message: 'Onset is too long' });
  if (!summary || !max(summary, 1000))
    issues.push({
      field: 'summary',
      message: 'Description is required and must be at most 1000 characters',
    });
  if (value.acquisitionSource !== undefined && !oneOf(value.acquisitionSource, acquisitionSources))
    issues.push({ field: 'acquisitionSource', message: 'Unsupported acquisition source' });
  for (const key of ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent'])
    if (value[key] !== undefined && (!text(value[key]) || !max(text(value[key]), 120)))
      issues.push({ field: key, message: 'Campaign value is invalid' });
  if (value.privacyNoticeVersion !== privacyVersion)
    issues.push({ field: 'privacyNoticeVersion', message: 'Privacy notice version is not active' });
  if (value.privacyAcknowledged !== true)
    issues.push({
      field: 'privacyAcknowledged',
      message: 'Privacy notice acknowledgement is required',
    });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      locale: locale as Locale,
      domain: domain as InquiryDomain,
      preferredContactChannel: channel as ContactChannel,
      personName,
      contactValue: normalizeContact(channel as ContactChannel, contactValue),
      locality,
      address: address || undefined,
      species,
      speciesOther: speciesOther || undefined,
      groupScope: groupScope || undefined,
      affectedCount: value.affectedCount as number | undefined,
      reason,
      onset: onset || undefined,
      summary,
      acquisitionSource: (value.acquisitionSource as AcquisitionSource | undefined) ?? 'unknown',
      utmSource: text(value.utmSource) || undefined,
      utmMedium: text(value.utmMedium) || undefined,
      utmCampaign: text(value.utmCampaign) || undefined,
      utmContent: text(value.utmContent) || undefined,
      privacyNoticeVersion: privacyVersion,
      privacyAcknowledged: true,
    },
  };
}

export function validateOfficeInquiry(input: unknown): ValidationResult<OfficeInquiryInput> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return { ok: false, issues: [{ field: 'body', message: 'Object required' }] };
  const value = input as Record<string, unknown>;
  const { source: _source, contactChannel: _contactChannel, ...publicFields } = value;
  const publicResult = validatePublicInquiry(
    { ...publicFields, privacyNoticeVersion: 'office', privacyAcknowledged: true },
    'office',
  );
  if (!publicResult.ok) return publicResult;
  const source = text(value.source);
  const contactChannel = text(value.contactChannel) || text(value.preferredContactChannel);
  const normalizedSource = oneOf(source, [...officeSources, 'web_form']) ? source : 'other';
  const normalizedChannel = oneOf(contactChannel, officeContactChannels) ? contactChannel : 'other';
  return {
    ok: true,
    value: {
      ...publicResult.value,
      source: normalizedSource,
      preferredContactChannel: normalizedChannel,
      contactChannel: normalizedChannel,
    },
  };
}

export function canTransition(from: InquiryStatus, to: InquiryStatus): boolean {
  if (from === to) return true;
  if (from === 'CLOSED') return to === 'IN_PROGRESS' || to === 'FOLLOW_UP';
  return statuses.includes(to);
}

export const encounterTypes = ['AT_SITE', 'FIELD_VISIT', 'REMOTE'] as const;
export type EncounterType = (typeof encounterTypes)[number];
export const encounterStatuses = ['DRAFT', 'COMPLETED'] as const;
export type EncounterStatus = (typeof encounterStatuses)[number];
export const encounterSources = ['INQUIRY', 'MANUAL'] as const;
export type EncounterSource = (typeof encounterSources)[number];
export const animalSexes = ['MALE', 'FEMALE', 'UNKNOWN'] as const;
export type AnimalSex = (typeof animalSexes)[number];
export const clientContactTypes = ['PHONE', 'TELEGRAM', 'EMAIL', 'OTHER'] as const;
export type ClientContactType = (typeof clientContactTypes)[number];
export const diagnosisTypes = ['WORKING', 'DIFFERENTIAL', 'FINAL'] as const;
export type DiagnosisType = (typeof diagnosisTypes)[number];
export const medicationAdministrationTypes = ['ADMINISTERED', 'PRESCRIBED', 'RECOMMENDED'] as const;
export type MedicationAdministrationType = (typeof medicationAdministrationTypes)[number];
export const procedureTypes = [
  'WOUND_TREATMENT',
  'INJECTION',
  'CATHETER',
  'INFUSION',
  'SURGERY',
  'DRESSING',
  'SAMPLING',
  'OTHER',
] as const;
export type ProcedureType = (typeof procedureTypes)[number];
export const followUpStatuses = ['OPEN', 'DONE', 'CANCELLED'] as const;
export type FollowUpStatus = (typeof followUpStatuses)[number];
export const patientAlertTypes = [
  'ALLERGY',
  'ADVERSE_REACTION',
  'BEHAVIOR',
  'CHRONIC',
  'OTHER',
] as const;
export type PatientAlertType = (typeof patientAlertTypes)[number];

export type M14Actor = { actor: string; role: 'CLINICIAN' | 'TECH_ADMIN'; requestId: string };
export type M14Subject =
  | { animalId: string; animalGroupId?: never; holdingId?: never }
  | { animalGroupId: string; animalId?: never; holdingId?: never }
  | { holdingId: string; animalId?: never; animalGroupId?: never };

export type ClientInput = {
  displayName: string;
  locality?: string;
  addressText?: string;
  notes?: string;
  contacts?: Array<{ type: ClientContactType; value: string; isPrimary?: boolean }>;
};
export type HoldingInput = {
  displayName?: string;
  primaryClientId?: string;
  locality: string;
  addressText?: string;
  notes?: string;
};
export type AnimalInput = {
  domain: InquiryDomain;
  clientId?: string;
  holdingId?: string;
  name?: string;
  identifier?: string;
  speciesCode: string;
  speciesText?: string;
  breed?: string;
  sex?: AnimalSex;
  reproductiveStatus?: string;
  birthDate?: string;
  ageText?: string;
  notes?: string;
};
export type AnimalGroupInput = {
  holdingId: string;
  displayName: string;
  speciesCode: string;
  speciesText?: string;
  approxCount?: number;
  ageDescription?: string;
  notes?: string;
};
export type EncounterInput = M14Subject & {
  encounterType: EncounterType;
  source?: EncounterSource;
  sourceInquiryId?: string;
  presentingProblem?: string;
  history?: string;
  examinationText?: string;
  assessment?: string;
  plan?: string;
  outcomeText?: string;
  vitals?: VitalsInput;
  populationCounts?: PopulationCountsInput;
};
export type VitalsInput = {
  observedAt?: string;
  weightKg?: number;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRatePerMin?: number;
  hydration?: string;
  mucousMembranes?: string;
  crtSeconds?: number;
  pain?: string;
  observations?: string;
};
export type PopulationCountsInput = {
  populationCount?: number;
  examinedCount?: number;
  affectedCount?: number;
  treatedCount?: number;
};
export type DiagnosisInput = { type: DiagnosisType; label: string; notes?: string };
export type MedicationInput = {
  drugName?: string;
  activeIngredient?: string;
  doseValue?: number;
  doseUnit?: string;
  doseBasis?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  doseText?: string;
  administrationType: MedicationAdministrationType;
};
export type ProcedureInput = { type: ProcedureType; label?: string; notes?: string };
export type VaccinationInput = M14Subject extends never
  ? never
  : {
      animalId?: string;
      animalGroupId?: string;
      encounterId?: string;
      date: string;
      vaccineName: string;
      manufacturer?: string;
      batchLot?: string;
      route?: string;
      nextDueAt?: string;
      notes?: string;
    };
export type FollowUpInput = M14Subject & { encounterId: string; dueAt: string; reason: string };
export type PatientAlertInput = {
  animalId: string;
  type: PatientAlertType;
  shortLabel: string;
  notes?: string;
};

const optionalText = (value: unknown, length: number) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim().length <= length);
const requiredText = (value: unknown, length: number) =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= length;
const positiveNumber = (value: unknown, maxValue: number) =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= maxValue);
const nonNegativeInteger = (value: unknown, maxValue = 1_000_000) =>
  value === undefined ||
  (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= maxValue);
const boundedNumber = (value: unknown, minValue: number, maxValue: number) =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value) && value >= minValue && value <= maxValue);
const validIso = (value: unknown) =>
  value === undefined || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
const m14Issues = (input: unknown): ValidationIssue[] => {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return [{ field: 'body', message: 'Object required' }];
  return [];
};

function validateEncounterNestedValues(value: Record<string, unknown>, issues: ValidationIssue[]) {
  if (value.vitals !== undefined) {
    if (!value.vitals || typeof value.vitals !== 'object' || Array.isArray(value.vitals))
      issues.push({ field: 'vitals', message: 'Vitals are invalid' });
    else {
      const vitals = value.vitals as Record<string, unknown>;
      if (!validIso(vitals.observedAt))
        issues.push({ field: 'vitals.observedAt', message: 'Date is invalid' });
      if (!boundedNumber(vitals.weightKg, 0, 100000) || vitals.weightKg === 0)
        issues.push({ field: 'vitals.weightKg', message: 'Weight is invalid' });
      if (!boundedNumber(vitals.temperatureC, -100, 100))
        issues.push({ field: 'vitals.temperatureC', message: 'Temperature is invalid' });
      if (!nonNegativeInteger(vitals.heartRateBpm, 1000) || vitals.heartRateBpm === 0)
        issues.push({ field: 'vitals.heartRateBpm', message: 'Heart rate is invalid' });
      if (
        !nonNegativeInteger(vitals.respiratoryRatePerMin, 500) ||
        vitals.respiratoryRatePerMin === 0
      )
        issues.push({
          field: 'vitals.respiratoryRatePerMin',
          message: 'Respiratory rate is invalid',
        });
      if (!boundedNumber(vitals.crtSeconds, 0, 60))
        issues.push({ field: 'vitals.crtSeconds', message: 'CRT is invalid' });
      if (!optionalText(vitals.hydration, 120) || !optionalText(vitals.mucousMembranes, 120))
        issues.push({ field: 'vitals.observations', message: 'Vitals text is too long' });
      if (!optionalText(vitals.pain, 120) || !optionalText(vitals.observations, 2000))
        issues.push({ field: 'vitals.observations', message: 'Vitals text is too long' });
    }
  }
  if (value.populationCounts !== undefined) {
    if (
      !value.populationCounts ||
      typeof value.populationCounts !== 'object' ||
      Array.isArray(value.populationCounts)
    )
      issues.push({ field: 'populationCounts', message: 'Population counts are invalid' });
    else {
      const counts = value.populationCounts as Record<string, unknown>;
      for (const key of ['populationCount', 'examinedCount', 'affectedCount', 'treatedCount'])
        if (!nonNegativeInteger(counts[key]))
          issues.push({ field: `populationCounts.${key}`, message: 'Count is invalid' });
    }
  }
}

export function validateClientInput(input: unknown): ValidationResult<ClientInput> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  if (!requiredText(value.displayName, 160))
    issues.push({ field: 'displayName', message: 'Client name is required' });
  if (
    !optionalText(value.locality, 120) ||
    !optionalText(value.addressText, 250) ||
    !optionalText(value.notes, 2000)
  )
    issues.push({ field: 'details', message: 'Client details are too long' });
  if (value.contacts !== undefined && (!Array.isArray(value.contacts) || value.contacts.length > 8))
    issues.push({ field: 'contacts', message: 'Contacts are invalid' });
  const contacts = Array.isArray(value.contacts) ? value.contacts : [];
  contacts.forEach((contact, index) => {
    const row = contact as Record<string, unknown>;
    if (!oneOf(row.type, clientContactTypes) || !requiredText(row.value, 160))
      issues.push({ field: `contacts.${index}`, message: 'Contact is invalid' });
  });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      displayName: String(value.displayName).trim(),
      locality: text(value.locality) || undefined,
      addressText: text(value.addressText) || undefined,
      notes: text(value.notes) || undefined,
      contacts: contacts.map((contact) => ({
        type: (contact as Record<string, unknown>).type as ClientContactType,
        value: text((contact as Record<string, unknown>).value),
        isPrimary: (contact as Record<string, unknown>).isPrimary === true,
      })),
    },
  };
}

export function validateHoldingInput(input: unknown): ValidationResult<HoldingInput> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  if (!requiredText(value.locality, 120))
    issues.push({ field: 'locality', message: 'Locality is required' });
  if (
    !optionalText(value.displayName, 160) ||
    !optionalText(value.addressText, 250) ||
    !optionalText(value.notes, 2000)
  )
    issues.push({ field: 'details', message: 'Holding details are too long' });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      displayName: text(value.displayName) || undefined,
      primaryClientId: text(value.primaryClientId) || undefined,
      locality: text(value.locality),
      addressText: text(value.addressText) || undefined,
      notes: text(value.notes) || undefined,
    },
  };
}

export function validateAnimalInput(input: unknown): ValidationResult<AnimalInput> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  if (!oneOf(value.domain, domains)) issues.push({ field: 'domain', message: 'Domain is invalid' });
  if (!requiredText(value.speciesCode, 60))
    issues.push({ field: 'speciesCode', message: 'Species is required' });
  if (
    !optionalText(value.name, 160) ||
    !optionalText(value.identifier, 120) ||
    !optionalText(value.speciesText, 120) ||
    !optionalText(value.breed, 120) ||
    !optionalText(value.reproductiveStatus, 120) ||
    !optionalText(value.ageText, 120) ||
    !optionalText(value.notes, 2000)
  )
    issues.push({ field: 'details', message: 'Animal details are too long' });
  if (!oneOf(value.sex ?? 'UNKNOWN', animalSexes) || !validIso(value.birthDate))
    issues.push({ field: 'animal', message: 'Animal values are invalid' });
  if (value.domain === 'FARM' && !text(value.holdingId))
    issues.push({ field: 'holdingId', message: 'Farm animals need a holding' });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      domain: value.domain as InquiryDomain,
      clientId: text(value.clientId) || undefined,
      holdingId: text(value.holdingId) || undefined,
      name: text(value.name) || undefined,
      identifier: text(value.identifier) || undefined,
      speciesCode: text(value.speciesCode),
      speciesText: text(value.speciesText) || undefined,
      breed: text(value.breed) || undefined,
      sex: (value.sex ?? 'UNKNOWN') as AnimalSex,
      reproductiveStatus: text(value.reproductiveStatus) || undefined,
      birthDate: text(value.birthDate) || undefined,
      ageText: text(value.ageText) || undefined,
      notes: text(value.notes) || undefined,
    },
  };
}

export function validateAnimalGroupInput(input: unknown): ValidationResult<AnimalGroupInput> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  if (
    !requiredText(value.holdingId, 80) ||
    !requiredText(value.displayName, 160) ||
    !requiredText(value.speciesCode, 60)
  )
    issues.push({ field: 'group', message: 'Group identity is required' });
  if (
    !nonNegativeInteger(value.approxCount) ||
    !optionalText(value.speciesText, 120) ||
    !optionalText(value.ageDescription, 120) ||
    !optionalText(value.notes, 2000)
  )
    issues.push({ field: 'details', message: 'Group details are invalid' });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      holdingId: text(value.holdingId),
      displayName: text(value.displayName),
      speciesCode: text(value.speciesCode),
      speciesText: text(value.speciesText) || undefined,
      approxCount: value.approxCount as number | undefined,
      ageDescription: text(value.ageDescription) || undefined,
      notes: text(value.notes) || undefined,
    },
  };
}

export function validateEncounterInput(input: unknown): ValidationResult<EncounterInput> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  const subjectCount = ['animalId', 'animalGroupId', 'holdingId'].filter((key) =>
    text(value[key]),
  ).length;
  if (subjectCount !== 1)
    issues.push({ field: 'subject', message: 'Exactly one encounter subject is required' });
  if (!oneOf(value.encounterType, encounterTypes))
    issues.push({ field: 'encounterType', message: 'Encounter type is invalid' });
  for (const key of [
    'presentingProblem',
    'history',
    'examinationText',
    'assessment',
    'plan',
    'outcomeText',
  ])
    if (!optionalText(value[key], 8000)) issues.push({ field: key, message: 'Text is too long' });
  if (value.source !== undefined && !oneOf(value.source, encounterSources))
    issues.push({ field: 'source', message: 'Encounter source is invalid' });
  validateEncounterNestedValues(value, issues);
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: {
      animalId: text(value.animalId) || undefined,
      animalGroupId: text(value.animalGroupId) || undefined,
      holdingId: text(value.holdingId) || undefined,
      encounterType: value.encounterType as EncounterType,
      source: (value.source ?? 'MANUAL') as EncounterSource,
      sourceInquiryId: text(value.sourceInquiryId) || undefined,
      presentingProblem: text(value.presentingProblem) || undefined,
      history: text(value.history) || undefined,
      examinationText: text(value.examinationText) || undefined,
      assessment: text(value.assessment) || undefined,
      plan: text(value.plan) || undefined,
      outcomeText: text(value.outcomeText) || undefined,
      vitals: value.vitals as VitalsInput | undefined,
      populationCounts: value.populationCounts as PopulationCountsInput | undefined,
    } as EncounterInput,
  };
}

export function validateEncounterUpdateInput(
  input: unknown,
): ValidationResult<Partial<EncounterInput>> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  const fields = [
    'presentingProblem',
    'history',
    'examinationText',
    'assessment',
    'plan',
    'outcomeText',
  ] as const;
  if (!fields.some((field) => field in value))
    issues.push({ field: 'encounter', message: 'At least one encounter field is required' });
  for (const key of fields)
    if (key in value && !optionalText(value[key], 8000))
      issues.push({ field: key, message: 'Text is too long' });
  if (issues.length) return { ok: false, issues };
  return {
    ok: true,
    value: Object.fromEntries(
      fields.filter((field) => field in value).map((field) => [field, value[field]]),
    ) as Partial<EncounterInput>,
  };
}

export function validateClinicalChild(
  kind: 'diagnosis' | 'medication' | 'procedure' | 'vaccination' | 'followup' | 'alert',
  input: unknown,
): ValidationResult<Record<string, unknown>> {
  const issues = m14Issues(input);
  const value = (input ?? {}) as Record<string, unknown>;
  if (
    kind === 'diagnosis' &&
    (!oneOf(value.type, diagnosisTypes) || !requiredText(value.label, 240))
  )
    issues.push({ field: 'diagnosis', message: 'Diagnosis is invalid' });
  if (kind === 'medication') {
    if (!oneOf(value.administrationType, medicationAdministrationTypes))
      issues.push({ field: 'administrationType', message: 'Administration type is invalid' });
    if (
      !optionalText(value.drugName, 240) ||
      !optionalText(value.doseText, 1000) ||
      !optionalText(value.instructions, 2000) ||
      !positiveNumber(value.doseValue, 100000)
    )
      issues.push({ field: 'medication', message: 'Medication is invalid' });
    if (!text(value.drugName) && !text(value.doseText) && !text(value.instructions))
      issues.push({ field: 'medication', message: 'Medication text is required' });
  }
  if (
    kind === 'procedure' &&
    (!oneOf(value.type, procedureTypes) ||
      !optionalText(value.label, 240) ||
      !optionalText(value.notes, 2000))
  )
    issues.push({ field: 'procedure', message: 'Procedure is invalid' });
  if (
    kind === 'vaccination' &&
    ((!text(value.animalId) && !text(value.animalGroupId)) ||
      (!!text(value.animalId) && !!text(value.animalGroupId)) ||
      !requiredText(value.date, 40) ||
      !validIso(value.date) ||
      !requiredText(value.vaccineName, 240))
  )
    issues.push({ field: 'vaccination', message: 'Vaccination is invalid' });
  if (
    kind === 'followup' &&
    (!requiredText(value.encounterId, 80) ||
      !validIso(value.dueAt) ||
      !requiredText(value.reason, 1000))
  )
    issues.push({ field: 'followup', message: 'Follow-up is invalid' });
  if (
    kind === 'alert' &&
    (!requiredText(value.animalId, 80) ||
      !oneOf(value.type, patientAlertTypes) ||
      !requiredText(value.shortLabel, 240) ||
      !optionalText(value.notes, 2000))
  )
    issues.push({ field: 'alert', message: 'Alert is invalid' });
  return issues.length ? { ok: false, issues } : { ok: true, value };
}
