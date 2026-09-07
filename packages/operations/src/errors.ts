export const errorCodes = [
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
export type ErrorCode = (typeof errorCodes)[number];
const known = new Set<string>(errorCodes);

export function toErrorCode(value: unknown): ErrorCode {
  if (typeof value === 'string' && known.has(value)) return value as ErrorCode;
  switch (value) {
    case 'not_found':
    case 'subject_not_found':
      return 'NOT_FOUND';
    case 'conflict':
    case 'already_completed':
    case 'subject_mismatch':
      return 'CONFLICT';
    case 'unauthorized':
      return 'UNAUTHORIZED';
    case 'forbidden':
      return 'FORBIDDEN';
    case 'db_constraint':
      return 'DB_CONSTRAINT_ERROR';
    case 'db_read':
      return 'DB_READ_ERROR';
    case 'db_write':
      return 'DB_WRITE_ERROR';
    case 'external_service':
      return 'EXTERNAL_SERVICE_ERROR';
    case 'scheduled_job':
      return 'SCHEDULED_JOB_ERROR';
    case 'telemetry':
      return 'TELEMETRY_ERROR';
    case 'invalid_transition':
    case 'outcome_required':
    case 'invalid_date':
    case 'invalid_note':
    case 'validation':
    case 'payload_too_large':
      return 'VALIDATION_ERROR';
    default:
      return 'INTERNAL_ERROR';
  }
}

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && known.has(value);
}
