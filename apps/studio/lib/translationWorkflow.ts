export type TranslationLanguage = 'ro' | 'uk';

export function buildTranslationDraft(
  source: Record<string, unknown>,
  language: TranslationLanguage,
) {
  const sourceId = String(source._id ?? '').replace(/^drafts\./, '');
  if (!sourceId || source.language !== 'ru')
    throw new Error('Translations can only be created from a RU source.');
  return {
    ...source,
    _id: `drafts.${sourceId}-${language}`,
    language,
    translatedFrom: { _type: 'reference', _ref: sourceId, _weak: true },
    sourceMedicalRevision: undefined,
    title: `${String(source.title ?? '')} — ${language.toUpperCase()}`,
  };
}

export function reviewedSourceRevision(input: {
  language?: string;
  sourceMedicalRevision?: number;
  currentSourceRevision?: number;
}) {
  if (input.language === 'ru')
    throw new Error('RU sources do not receive translation review metadata.');
  if (!Number.isInteger(input.currentSourceRevision) || (input.currentSourceRevision ?? 0) < 1)
    throw new Error('A valid current source medicalRevision is required.');
  return input.currentSourceRevision;
}
