import { defineField, defineType } from 'sanity';
import { languages, primaryDomains, riskLevels } from './shared';

export const clinicalCase = defineType({
  name: 'clinicalCase',
  title: 'Клинический случай',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Язык',
      type: 'string',
      options: { list: languages },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'translationGroupId',
      title: 'Translation family',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'translatedFrom',
      title: 'Переведено с',
      type: 'reference',
      to: [{ type: 'clinicalCase' }],
      weak: true,
    }),
    defineField({
      name: 'primaryDomain',
      title: 'Основной домен',
      type: 'string',
      options: { list: primaryDomains },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'medicalOwner',
      title: 'Медицинский владелец',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'riskLevel',
      title: 'Уровень риска',
      type: 'string',
      options: { list: riskLevels },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'medicalRevision',
      title: 'Медицинская редакция',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'lastMedicalReview',
      title: 'Последняя медицинская проверка',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reviewIntervalMonths',
      title: 'Интервал проверки (месяцев)',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'sources',
      title: 'Источники',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'source' }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'consentVerified',
      title: 'Согласие подтверждено',
      type: 'boolean',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'consentReference',
      title: 'Внутренний идентификатор согласия',
      type: 'string',
    }),
    defineField({
      name: 'anonymisationVerified',
      title: 'Анонимизация подтверждена',
      type: 'boolean',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'body', title: 'Текст', type: 'array', of: [{ type: 'block' }] }),
  ],
  validation: (Rule) =>
    Rule.custom((document) => {
      const item = document as Record<string, unknown> | undefined;
      return item?.consentVerified && item?.anonymisationVerified
        ? true
        : 'Публикация кейса требует подтверждённых согласия и анонимизации.';
    }),
});
