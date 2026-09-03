export type TranslationState = 'CURRENT' | 'MISSING' | 'REVIEW_REQUIRED' | 'WITHDRAWN';

export interface TranslationFacts {
  exists: boolean;
  withdrawn?: boolean;
  medicalRevision?: number;
  sourceMedicalRevision?: number;
}

/** Derives a user-facing translation state from stored editorial facts only. */
export function getTranslationState({
  exists,
  withdrawn,
  medicalRevision,
  sourceMedicalRevision,
}: TranslationFacts): TranslationState {
  if (!exists) return 'MISSING';
  if (withdrawn) return 'WITHDRAWN';
  if (
    medicalRevision !== undefined &&
    sourceMedicalRevision !== undefined &&
    medicalRevision !== sourceMedicalRevision
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
