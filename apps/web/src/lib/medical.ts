export type MedicalReviewState = 'CURRENT' | 'REVIEW_REQUIRED';
export type SourceHealth = 'current' | 'superseded' | 'withdrawn' | 'missing';
export type PublicSafetyState = 'CURRENT' | 'STALE_HIGH_RISK' | 'WITHDRAWN';

type ReviewFacts = {
  lastMedicalReview?: string;
  reviewIntervalMonths?: number;
  riskLevel?: 'HIGH' | 'STANDARD' | 'LOW';
};

function calendarDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(+date) ? undefined : date;
}

export function addCalendarMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function deriveMedicalReviewState(facts: ReviewFacts, now: string): MedicalReviewState {
  const reviewed = facts.lastMedicalReview ? calendarDate(facts.lastMedicalReview) : undefined;
  const today = calendarDate(now);
  if (!reviewed || !today || !facts.reviewIntervalMonths || facts.reviewIntervalMonths < 1)
    return 'REVIEW_REQUIRED';
  const due = addCalendarMonths(reviewed, facts.reviewIntervalMonths);
  return today < due ? 'CURRENT' : 'REVIEW_REQUIRED';
}

export function deriveSourceHealth(
  sources: Array<{ status?: string } | null | undefined>,
): SourceHealth {
  if (!sources.length || sources.some((source) => !source)) return 'missing';
  if (sources.some((source) => source?.status === 'withdrawn')) return 'withdrawn';
  if (sources.some((source) => source?.status === 'superseded')) return 'superseded';
  return sources.every((source) => source?.status === 'current') ? 'current' : 'missing';
}

export function derivePublicSafetyState(input: {
  riskLevel?: string;
  withdrawn?: boolean;
  reviewState: MedicalReviewState;
  sourceHealth: SourceHealth;
  governanceValid?: boolean;
}): PublicSafetyState {
  if (input.withdrawn) return 'WITHDRAWN';
  if (input.governanceValid === false) return 'STALE_HIGH_RISK';
  if (
    input.riskLevel === 'HIGH' &&
    (input.reviewState === 'REVIEW_REQUIRED' ||
      input.sourceHealth === 'withdrawn' ||
      input.sourceHealth === 'missing')
  )
    return 'STALE_HIGH_RISK';
  return 'CURRENT';
}

export function isDiscoveryEligible(
  input: {
    riskLevel?: 'HIGH' | 'STANDARD' | 'LOW';
    medicalOwner?: unknown;
    reviewedBy?: unknown;
    lastMedicalReview?: string;
    reviewIntervalMonths?: number;
    sourceStatuses?: Array<string | null | undefined>;
    withdrawn?: boolean;
  },
  now: string,
): boolean {
  const sourceHealth = deriveSourceHealth(
    (input.sourceStatuses ?? []).map((status) => (status ? { status } : undefined)),
  );
  return (
    derivePublicSafetyState({
      riskLevel: input.riskLevel,
      reviewState: deriveMedicalReviewState(input, now),
      sourceHealth,
      withdrawn: input.withdrawn,
      governanceValid:
        Boolean(input.medicalOwner) && (input.riskLevel !== 'HIGH' || Boolean(input.reviewedBy)),
    }) === 'CURRENT'
  );
}
