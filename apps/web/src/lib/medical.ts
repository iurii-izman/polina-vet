export type MedicalReviewState = 'CURRENT' | 'REVIEW_REQUIRED';
export type SourceHealth = 'current' | 'superseded' | 'withdrawn' | 'missing';
export type TranslationState = 'CURRENT' | 'REVIEW_REQUIRED' | 'PENDING' | 'WITHDRAWN';
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
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function deriveMedicalReviewState(facts: ReviewFacts, now: string): MedicalReviewState {
  const reviewed = facts.lastMedicalReview ? calendarDate(facts.lastMedicalReview) : undefined;
  const today = calendarDate(now);
  if (!reviewed || !today || !facts.reviewIntervalMonths || facts.reviewIntervalMonths < 1)
    return 'REVIEW_REQUIRED';
  const due = new Date(reviewed);
  due.setUTCMonth(due.getUTCMonth() + facts.reviewIntervalMonths);
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

export function deriveTranslationState(
  input:
    | {
        language?: string;
        translatedFromMedicalRevision?: number;
        sourceMedicalRevision?: number;
        withdrawn?: boolean;
      }
    | undefined,
): TranslationState {
  if (!input) return 'PENDING';
  if (input.withdrawn) return 'WITHDRAWN';
  if (input.language === 'ru') return 'CURRENT';
  if (!input.translatedFromMedicalRevision || !input.sourceMedicalRevision) return 'PENDING';
  return input.translatedFromMedicalRevision >= input.sourceMedicalRevision
    ? 'CURRENT'
    : 'REVIEW_REQUIRED';
}

export function derivePublicSafetyState(input: {
  riskLevel?: string;
  withdrawn?: boolean;
  reviewState: MedicalReviewState;
  sourceHealth: SourceHealth;
}): PublicSafetyState {
  if (input.withdrawn) return 'WITHDRAWN';
  if (
    input.riskLevel === 'HIGH' &&
    (input.reviewState === 'REVIEW_REQUIRED' ||
      input.sourceHealth === 'withdrawn' ||
      input.sourceHealth === 'missing')
  )
    return 'STALE_HIGH_RISK';
  return 'CURRENT';
}
