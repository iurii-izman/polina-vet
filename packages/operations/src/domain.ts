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
