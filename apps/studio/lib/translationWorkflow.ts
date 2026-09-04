export type TranslationLanguage = 'ro' | 'uk';

export function buildTranslationDraft(
  source: Record<string, unknown>,
  language: TranslationLanguage,
) {
  const sourceId = typeof source._id === 'string' ? source._id.replace(/^drafts\./, '') : '';
  if (!sourceId || source.language !== 'ru')
    throw new Error('Translations can only be created from a RU source.');
  const sourceTitle = typeof source.title === 'string' ? source.title : '';
  return {
    ...source,
    _id: `drafts.${sourceId}-${language}`,
    language,
    translatedFrom: { _type: 'reference', _ref: sourceId, _weak: true },
    sourceMedicalRevision: undefined,
    title: `${sourceTitle} — ${language.toUpperCase()}`,
  };
}

export function reviewedSourceRevision(input: {
  language?: string;
  currentSourceRevision?: number;
}) {
  if (input.language === 'ru')
    throw new Error('RU sources do not receive translation review metadata.');
  if (!Number.isInteger(input.currentSourceRevision) || (input.currentSourceRevision ?? 0) < 1)
    throw new Error('A valid current source medicalRevision is required.');
  return input.currentSourceRevision;
}

function referenceId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const ref = (value as { _ref?: unknown })._ref;
  return typeof ref === 'string' && ref ? ref : undefined;
}

export function resolveTranslationReview(input: {
  document?: Record<string, unknown> | null;
  source?: Record<string, unknown> | null;
}) {
  const document = input.document;
  if (!document) throw new Error('An editable translation document is required.');
  const language = typeof document.language === 'string' ? document.language : undefined;
  if (language === 'ru') throw new Error('RU sources do not receive translation review metadata.');
  if (language !== 'ro' && language !== 'uk')
    throw new Error('Only RO and UK translations can receive review confirmation.');

  const sourceId = referenceId(document.translatedFrom);
  if (!sourceId) throw new Error('A translatedFrom RU source is required.');
  if (input.source?.language !== 'ru')
    throw new Error('The translation source must be the RU source.');

  return {
    sourceId,
    sourceMedicalRevision: reviewedSourceRevision({
      language,
      currentSourceRevision: Number(input.source.medicalRevision),
    }),
  };
}
