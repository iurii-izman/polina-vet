import { useClient, useDocumentOperation } from 'sanity';
import type { DocumentActionComponent } from 'sanity';
import {
  buildTranslationDraft,
  resolveTranslationReview,
  type TranslationLanguage,
} from './translationWorkflow';

function createAction(language: TranslationLanguage): DocumentActionComponent {
  return (props) => {
    const client = useClient({ apiVersion: '2026-09-02' });
    const document = props.published as Record<string, unknown> | null;
    const sourceId = String(props.id).replace(/^drafts\./, '');
    return {
      label: `Создать перевод · ${language.toUpperCase()}`,
      disabled: props.type !== 'article' || document?.language !== 'ru',
      onHandle: async () => {
        if (!document) return;
        const draft = buildTranslationDraft({ ...document, _id: sourceId }, language);
        const existing = await client.getDocument(String(draft._id));
        if (existing) throw new Error(`Translation already exists: ${draft._id}`);
        await client.createIfNotExists(draft as never);
        props.onComplete();
      },
    };
  };
}

const confirmReview: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: '2026-09-02' });
  const { patch } = useDocumentOperation(props.id, props.type);
  const document = (props.draft ?? props.published) as Record<string, unknown> | null;
  const sourceId =
    document?.translatedFrom && typeof document.translatedFrom === 'object'
      ? (document.translatedFrom as { _ref?: string })._ref
      : undefined;
  return {
    label: 'Подтвердить медицинский пересмотр перевода',
    disabled: props.type !== 'article' || !document || document.language === 'ru' || !sourceId,
    onHandle: async () => {
      if (!document || !sourceId) return;
      const source = await client.getDocument(sourceId);
      const review = resolveTranslationReview({ document, source });
      patch.execute([
        {
          set: {
            sourceMedicalRevision: review.sourceMedicalRevision,
          },
        },
      ]);
      props.onComplete();
    },
  };
};

export const translationActions = [createAction('ro'), createAction('uk'), confirmReview];
