export type TranslationState = 'CURRENT' | 'REVIEW_REQUIRED' | 'PENDING' | 'WITHDRAWN';

export interface TranslationFacts {
  exists: boolean;
  withdrawn?: boolean;
  /** Current medical revision of the document from which this translation was made. */
  sourceCurrentMedicalRevision?: number;
  /** Medical revision of that source recorded when this translation was produced. */
  translationSourceMedicalRevision?: number;
}

export function hasCurrentTranslationLineage(input: {
  language?: string;
  translatedFrom?: {
    _id?: string | null;
    _ref?: string | null;
    medicalRevision?: number | null;
  } | null;
  sourceMedicalRevision?: number | null;
}): boolean {
  if (!input.language) return true;
  const language = stegaClean(input.language ?? '');
  if (language === 'ru') return !input.translatedFrom && input.sourceMedicalRevision == null;
  return Boolean(
    language &&
    language !== 'ru' &&
    (input.translatedFrom?._id || input.translatedFrom?._ref) &&
    Number.isInteger(input.sourceMedicalRevision) &&
    Number.isInteger(input.translatedFrom?.medicalRevision) &&
    input.sourceMedicalRevision === input.translatedFrom?.medicalRevision,
  );
}

/** Derives a user-facing translation state from stored editorial facts only. */
export function getTranslationState({
  exists,
  withdrawn,
  sourceCurrentMedicalRevision,
  translationSourceMedicalRevision,
}: TranslationFacts): TranslationState {
  if (!exists) return 'PENDING';
  if (withdrawn) return 'WITHDRAWN';
  if (
    sourceCurrentMedicalRevision === undefined ||
    translationSourceMedicalRevision === undefined ||
    sourceCurrentMedicalRevision !== translationSourceMedicalRevision
  )
    return 'REVIEW_REQUIRED';
  return 'CURRENT';
}

export interface WithdrawnContentFacts {
  withdrawn?: boolean;
  replacement?: string | null;
}

/** Never route withdrawn content to an unhelpful dead end when a replacement exists. */
export function getSafeReplacement({ withdrawn, replacement }: WithdrawnContentFacts) {
  return withdrawn && replacement ? replacement : null;
}
import { stegaClean } from '@sanity/client/stega';
