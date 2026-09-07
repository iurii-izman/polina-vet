import type { ErrorCode } from './errors.js';

export const TELEMETRY_SCHEMA_VERSION = 1 as const;

export interface TelemetrySink {
  writeDataPoint(event?: { indexes?: string[]; blobs?: string[]; doubles?: number[] }): void;
}

export const telemetryEventNames = [
  'CLIENT_CREATED',
  'ANIMAL_CREATED',
  'HOLDING_CREATED',
  'ANIMAL_GROUP_CREATED',
  'INQUIRY_CONVERTED',
  'ENCOUNTER_STARTED',
  'ENCOUNTER_DRAFT_SAVED',
  'ENCOUNTER_COMPLETED',
  'ENCOUNTER_CORRECTED',
  'DIAGNOSIS_ADDED',
  'MEDICATION_ADDED',
  'PROCEDURE_ADDED',
  'VACCINATION_RECORDED',
  'FOLLOWUP_CREATED',
  'FOLLOWUP_COMPLETED',
  'FOLLOWUP_CANCELLED',
  'SEARCH_EXECUTED',
  'DUPLICATE_CANDIDATE_SHOWN',
  'NEW_RECORD_CREATED_AFTER_DUPLICATE_WARNING',
  'VERSION_CONFLICT',
  'DOMAIN_ACTION_FAILED',
  'CLIENT_VALIDATION_BLOCKED',
  'UNSAVED_NAVIGATION_WARNING',
  'CLIENT_NETWORK_RETRY',
  'CLIENT_RUNTIME_FAILURE',
  'DAILY_SNAPSHOT',
] as const;
export type TelemetryEventName = (typeof telemetryEventNames)[number];

export const telemetryErrorCodes = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'DB_CONSTRAINT_ERROR',
  'DB_READ_ERROR',
  'DB_WRITE_ERROR',
  'EXTERNAL_SERVICE_ERROR',
  'SCHEDULED_JOB_ERROR',
  'TELEMETRY_ERROR',
  'INTERNAL_ERROR',
  'UNHANDLED_CLIENT_ERROR',
] as const;

export const routeClasses = [
  'office_page',
  'api_clients',
  'api_holdings',
  'api_animals',
  'api_animal_groups',
  'api_patients',
  'api_encounters',
  'api_followups',
  'api_vaccinations',
  'api_diagnoses',
  'api_inquiries',
  'api_search',
  'api_client_telemetry',
  'api_other',
  'scheduled_retention',
  'scheduled_snapshot',
] as const;
export type RouteClass = (typeof routeClasses)[number];

export const telemetryDomains = ['PET', 'FARM', 'NONE'] as const;
export type TelemetryDomain = (typeof telemetryDomains)[number];
export const subjectTypes = ['ANIMAL', 'ANIMAL_GROUP', 'HOLDING', 'NONE'] as const;
export type TelemetrySubjectType = (typeof subjectTypes)[number];
export const telemetryEncounterTypes = ['AT_SITE', 'FIELD_VISIT', 'REMOTE', 'NONE'] as const;
export type TelemetryEncounterType = (typeof telemetryEncounterTypes)[number];
export const telemetryResults = ['SUCCESS', 'FAILURE', 'CONFLICT'] as const;
export type TelemetryResult = (typeof telemetryResults)[number];
export const telemetrySources = ['MANUAL', 'INQUIRY', 'SYSTEM'] as const;
export type TelemetrySource = (typeof telemetrySources)[number];
export const dataOrigins = ['SYNTHETIC', 'REAL', 'SYSTEM'] as const;
export type DataOrigin = (typeof dataOrigins)[number];

export const snapshotMetrics = [
  'OPEN_DRAFTS_TOTAL',
  'OPEN_DRAFTS_LT_1D',
  'OPEN_DRAFTS_1_3D',
  'OPEN_DRAFTS_3_7D',
  'OPEN_DRAFTS_GT_7D',
  'OVERDUE_FOLLOWUPS_TOTAL',
  'ACTIVE_ANIMALS_TOTAL',
  'HOLDINGS_TOTAL',
  'ANIMAL_GROUPS_TOTAL',
  'ENCOUNTERS_COMPLETED_7D',
  'ENCOUNTERS_WITH_WEIGHT_7D',
  'ENCOUNTERS_WITH_VITALS_7D',
  'ENCOUNTERS_WITH_DIAGNOSIS_7D',
  'MEDICATIONS_STRUCTURED_7D',
  'MEDICATIONS_FREE_TEXT_ONLY_7D',
  'POST_COMPLETION_CORRECTIONS_7D',
] as const;
export type SnapshotMetric = (typeof snapshotMetrics)[number];

export interface TelemetryContext {
  environment: string;
  service: 'office';
  release: string;
  dataOrigin: DataOrigin;
}

export interface WorkflowEventInput {
  eventName: TelemetryEventName;
  routeClass?: RouteClass;
  domain?: TelemetryDomain;
  subjectType?: TelemetrySubjectType;
  encounterType?: TelemetryEncounterType;
  operation?: string;
  result?: TelemetryResult;
  errorCode?: ErrorCode;
  source?: TelemetrySource;
  durationMs?: number;
  workflowDurationMs?: number;
  resultCount?: number;
  changedFieldCount?: number;
  validationErrorCount?: number;
  metricName?: SnapshotMetric;
  metricValue?: number;
}

export interface TelemetryRecord {
  schema_version: typeof TELEMETRY_SCHEMA_VERSION;
  event_name: TelemetryEventName;
  environment: string;
  service: 'office';
  release: string;
  route_class: RouteClass | '';
  domain: TelemetryDomain | '';
  subject_type: TelemetrySubjectType | '';
  encounter_type: TelemetryEncounterType | '';
  operation: string;
  result: TelemetryResult | '';
  error_code: ErrorCode | '';
  source: TelemetrySource | '';
  data_origin: DataOrigin;
  metric_name: SnapshotMetric | '';
  duration_ms?: number;
  workflow_duration_ms?: number;
  result_count?: number;
  changed_field_count?: number;
  validation_error_count?: number;
  metric_value?: number;
}

const inputKeys = new Set([
  'eventName',
  'routeClass',
  'domain',
  'subjectType',
  'encounterType',
  'operation',
  'result',
  'errorCode',
  'source',
  'durationMs',
  'workflowDurationMs',
  'resultCount',
  'changedFieldCount',
  'validationErrorCount',
  'metricName',
  'metricValue',
]);
const enumSet = <T extends readonly string[]>(values: T) => new Set<string>(values);
const isFiniteMetric = (value: unknown) =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10_000_000_000);

function assertInput(input: WorkflowEventInput) {
  for (const key of Object.keys(input as unknown as Record<string, unknown>))
    if (!inputKeys.has(key)) throw new Error('TELEMETRY_ERROR');
  if (!enumSet(telemetryEventNames).has(input.eventName)) throw new Error('TELEMETRY_ERROR');
  if (input.routeClass && !enumSet(routeClasses).has(input.routeClass))
    throw new Error('TELEMETRY_ERROR');
  if (input.domain && !enumSet(telemetryDomains).has(input.domain))
    throw new Error('TELEMETRY_ERROR');
  if (input.subjectType && !enumSet(subjectTypes).has(input.subjectType))
    throw new Error('TELEMETRY_ERROR');
  if (input.encounterType && !enumSet(telemetryEncounterTypes).has(input.encounterType))
    throw new Error('TELEMETRY_ERROR');
  if (input.result && !enumSet(telemetryResults).has(input.result))
    throw new Error('TELEMETRY_ERROR');
  if (input.source && !enumSet(telemetrySources).has(input.source))
    throw new Error('TELEMETRY_ERROR');
  if (input.errorCode && !enumSet(telemetryErrorCodes).has(input.errorCode))
    throw new Error('TELEMETRY_ERROR');
  if (input.metricName && !enumSet(snapshotMetrics).has(input.metricName))
    throw new Error('TELEMETRY_ERROR');
  if (input.metricName && input.eventName !== 'DAILY_SNAPSHOT') throw new Error('TELEMETRY_ERROR');
  if (
    input.eventName === 'DAILY_SNAPSHOT' &&
    (!input.metricName || input.metricValue === undefined)
  )
    throw new Error('TELEMETRY_ERROR');
  for (const value of [
    input.durationMs,
    input.workflowDurationMs,
    input.resultCount,
    input.changedFieldCount,
    input.validationErrorCount,
    input.metricValue,
  ])
    if (!isFiniteMetric(value)) throw new Error('TELEMETRY_ERROR');
  if (input.operation && !/^[A-Z0-9_]{1,64}$/.test(input.operation))
    throw new Error('TELEMETRY_ERROR');
}

export function buildTelemetryEvent(
  context: TelemetryContext,
  input: WorkflowEventInput,
): TelemetryRecord {
  assertInput(input);
  return {
    schema_version: TELEMETRY_SCHEMA_VERSION,
    event_name: input.eventName,
    environment: context.environment.slice(0, 64),
    service: context.service,
    release: context.release.slice(0, 128),
    route_class: input.routeClass ?? '',
    domain: input.domain ?? '',
    subject_type: input.subjectType ?? '',
    encounter_type: input.encounterType ?? '',
    operation: input.operation ?? '',
    result: input.result ?? '',
    error_code: input.errorCode ?? '',
    source: input.source ?? '',
    data_origin: context.dataOrigin,
    metric_name: input.metricName ?? '',
    ...(input.durationMs === undefined ? {} : { duration_ms: input.durationMs }),
    ...(input.workflowDurationMs === undefined
      ? {}
      : { workflow_duration_ms: input.workflowDurationMs }),
    ...(input.resultCount === undefined ? {} : { result_count: input.resultCount }),
    ...(input.changedFieldCount === undefined
      ? {}
      : { changed_field_count: input.changedFieldCount }),
    ...(input.validationErrorCount === undefined
      ? {}
      : { validation_error_count: input.validationErrorCount }),
    ...(input.metricValue === undefined ? {} : { metric_value: input.metricValue }),
  };
}

function dataPoint(event: TelemetryRecord) {
  const blob = (value: string | number | undefined) => (value === undefined ? '' : String(value));
  return {
    indexes: [event.event_name],
    blobs: [
      blob(event.schema_version),
      event.event_name,
      event.environment,
      event.service,
      event.release,
      event.route_class,
      event.domain,
      event.subject_type,
      event.encounter_type,
      event.operation,
      event.result,
      event.error_code,
      event.source,
      event.data_origin,
      event.metric_name,
    ],
    doubles: [
      event.duration_ms ?? 0,
      event.workflow_duration_ms ?? 0,
      event.result_count ?? 0,
      event.changed_field_count ?? 0,
      event.validation_error_count ?? 0,
      event.metric_value ?? 0,
    ],
  };
}

export function recordWorkflowEvent(
  sink: TelemetrySink | undefined,
  context: TelemetryContext,
  input: WorkflowEventInput,
): boolean {
  try {
    if (!sink) return false;
    sink.writeDataPoint(dataPoint(buildTelemetryEvent(context, input)));
    return true;
  } catch {
    return false;
  }
}

export function recordDailySnapshot(
  sink: TelemetrySink | undefined,
  context: TelemetryContext,
  metricName: SnapshotMetric,
  metricValue: number,
): boolean {
  return recordWorkflowEvent(sink, context, {
    eventName: 'DAILY_SNAPSHOT',
    routeClass: 'scheduled_snapshot',
    operation: 'DAILY_SNAPSHOT',
    result: 'SUCCESS',
    source: 'SYSTEM',
    metricName,
    metricValue,
  });
}

export function recordClientFrictionEvent(
  sink: TelemetrySink | undefined,
  context: TelemetryContext,
  input: Omit<WorkflowEventInput, 'routeClass'>,
  routeClass: RouteClass,
): boolean {
  if (
    ![
      'CLIENT_VALIDATION_BLOCKED',
      'UNSAVED_NAVIGATION_WARNING',
      'CLIENT_NETWORK_RETRY',
      'CLIENT_RUNTIME_FAILURE',
    ].includes(input.eventName)
  )
    return false;
  return recordWorkflowEvent(sink, context, { ...input, routeClass });
}

export function routeClassForPath(pathname: string): RouteClass {
  if (!pathname.startsWith('/api/')) return 'office_page';
  const segment = pathname.split('/')[2] ?? '';
  const map: Record<string, RouteClass> = {
    clients: 'api_clients',
    holdings: 'api_holdings',
    animals: 'api_animals',
    'animal-groups': 'api_animal_groups',
    patients: 'api_patients',
    encounters: 'api_encounters',
    followups: 'api_followups',
    vaccinations: 'api_vaccinations',
    diagnoses: 'api_diagnoses',
    inquiries: 'api_inquiries',
    search: 'api_search',
    telemetry: 'api_client_telemetry',
  };
  return map[segment] ?? 'api_other';
}
