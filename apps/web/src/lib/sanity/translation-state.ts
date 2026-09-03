export type TranslationState = 'CURRENT' | 'MISSING' | 'REVIEW_REQUIRED' | 'WITHDRAWN';

export interface TranslationFacts {
  exists: boolean;
  withdrawn?: boolean;
  /** Current medical revision of the document from which this translation was made. */
  sourceCurrentMedicalRevision?: number;
  /** Medical revision of that source recorded when this translation was produced. */
  translationSourceMedicalRevision?: number;
}

/** Derives a user-facing translation state from stored editorial facts only. */
export function getTranslationState({
  exists,
  withdrawn,
  sourceCurrentMedicalRevision,
  translationSourceMedicalRevision,
}: TranslationFacts): TranslationState {
  if (!exists) return 'MISSING';
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
