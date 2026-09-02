import { defineField, defineType } from 'sanity';

import { languages, primaryDomains, riskLevels } from './shared';

export const article = defineType({
  name: 'article',
  title: 'Материал',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value?.current?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            ? true
            : 'Slug может содержать только строчные латинские буквы, цифры и дефисы.',
        ),
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
      to: [{ type: 'article' }],
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
      name: 'reviewedBy',
      title: 'Независимый рецензент',
      type: 'reference',
      to: [{ type: 'author' }],
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
      name: 'sourceMedicalRevision',
      title: 'Медицинская редакция источника',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1),
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
      name: 'species',
      title: 'Виды животных',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'species' }] }],
    }),
    defineField({
      name: 'topics',
      title: 'Темы',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'topic' }] }],
    }),
    defineField({ name: 'body', title: 'Текст', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'previousSlugs',
      title: 'Предыдущие slugs',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'archived', title: 'Архивный', type: 'boolean', initialValue: false }),
    defineField({
      name: 'withdrawn',
      title: 'Снят с публикации',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'replacement',
      title: 'Безопасная замена',
      type: 'reference',
      to: [{ type: 'article' }],
      weak: true,
    }),
  ],
  validation: (Rule) =>
    Rule.custom((document) => {
      if (!document || typeof document !== 'object') return true;
      const item = document as Record<string, unknown>;
      const errors: string[] = [];
      if (item.language !== 'ru' && (!item.translatedFrom || !item.sourceMedicalRevision))
        errors.push('Переводу нужны translatedFrom и sourceMedicalRevision.');
      if (item.language === 'ru' && item.translatedFrom)
        errors.push('RU-источник не должен иметь translatedFrom.');
      if (item.riskLevel === 'HIGH' && !item.reviewedBy)
        errors.push('Для HIGH-risk материала нужен независимый рецензент.');
      if (item.withdrawn && !item.replacement)
        errors.push('Снятому материалу нужна безопасная замена.');
      return errors.length ? errors.join(' ') : true;
    }),
});
