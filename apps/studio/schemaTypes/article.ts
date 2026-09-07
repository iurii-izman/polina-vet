import { defineArrayMember, defineField, defineType } from 'sanity';
import { languages, primaryDomains, riskLevels } from './shared';
import { portableTextBlock } from './portableText';

export const article = defineType({
  name: 'article',
  title: 'Материал',
  type: 'document',
  fieldsets: [
    { name: 'content', title: 'CONTENT' },
    { name: 'routing', title: 'ROUTING', options: { collapsible: true } },
    { name: 'governance', title: 'MEDICAL GOVERNANCE', options: { collapsible: true } },
    { name: 'lifecycle', title: 'LIFECYCLE', options: { collapsible: true, collapsed: true } },
    { name: 'seo', title: 'SEO', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок',
      type: 'string',
      validation: (Rule) => Rule.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'summary',
      title: 'Краткое описание',
      type: 'text',
      rows: 3,
      description: 'Публичное описание и meta description по умолчанию.',
      validation: (Rule) => Rule.required().min(1),
      fieldset: 'content',
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
      fieldset: 'routing',
    }),
    defineField({
      name: 'language',
      title: 'Язык',
      type: 'string',
      options: { list: languages },
      validation: (Rule) => Rule.required(),
      fieldset: 'routing',
    }),
    defineField({
      name: 'translationGroupId',
      title: 'Translation family',
      type: 'string',
      validation: (Rule) => Rule.required(),
      fieldset: 'routing',
    }),
    defineField({
      name: 'translatedFrom',
      title: 'Переведено с',
      type: 'reference',
      to: [{ type: 'article' }],
      weak: true,
      fieldset: 'routing',
    }),
    defineField({
      name: 'primaryDomain',
      title: 'Основной домен',
      type: 'string',
      options: { list: primaryDomains },
      validation: (Rule) => Rule.required(),
      fieldset: 'routing',
    }),
    defineField({
      name: 'medicalOwner',
      title: 'Медицинский владелец',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
      fieldset: 'governance',
    }),
    defineField({
      name: 'reviewedBy',
      title: 'Независимый рецензент',
      type: 'reference',
      to: [{ type: 'author' }],
      fieldset: 'governance',
    }),
    defineField({
      name: 'riskLevel',
      title: 'Уровень риска',
      type: 'string',
      options: { list: riskLevels },
      validation: (Rule) => Rule.required(),
      fieldset: 'governance',
    }),
    defineField({
      name: 'medicalRevision',
      title: 'Медицинская редакция',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
      fieldset: 'governance',
    }),
    defineField({
      name: 'sourceMedicalRevision',
      title: 'Медицинская редакция источника',
      type: 'number',
      validation: (Rule) => Rule.integer().min(1),
      fieldset: 'governance',
    }),
    defineField({
      name: 'lastMedicalReview',
      title: 'Последняя медицинская проверка',
      type: 'date',
      validation: (Rule) => Rule.required(),
      fieldset: 'governance',
    }),
    defineField({
      name: 'reviewIntervalMonths',
      title: 'Интервал проверки (месяцев)',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
      fieldset: 'governance',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Заметки по проверке',
      type: 'text',
      rows: 3,
      description:
        'Production dataset is public. Не добавляйте персональные данные владельцев/пациентов или конфиденциальные внутренние сведения.',
      fieldset: 'governance',
    }),
    defineField({
      name: 'sources',
      title: 'Источники',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'source' }] })],
      validation: (Rule) => Rule.required().min(1),
      fieldset: 'governance',
    }),
    defineField({
      name: 'species',
      title: 'Виды животных',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'species' }] })],
      fieldset: 'content',
    }),
    defineField({
      name: 'topics',
      title: 'Темы',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'topic' }] })],
      fieldset: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Текст и смысловые блоки',
      type: 'array',
      of: [
        portableTextBlock,
        defineArrayMember({ type: 'practicalActions' }),
        defineArrayMember({ type: 'dontDoBlock' }),
        defineArrayMember({ type: 'redFlagCategory' }),
        defineArrayMember({ type: 'checklist' }),
        defineArrayMember({ type: 'nextSteps' }),
        defineArrayMember({ type: 'safetyNotice' }),
      ],
      validation: (Rule) => Rule.required().min(1),
      fieldset: 'content',
    }),
    defineField({
      name: 'previousSlugs',
      title: 'Предыдущие slugs',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      fieldset: 'lifecycle',
    }),
    defineField({
      name: 'archived',
      title: 'Архивный',
      type: 'boolean',
      initialValue: false,
      fieldset: 'lifecycle',
    }),
    defineField({
      name: 'withdrawn',
      title: 'Снят с публикации',
      type: 'boolean',
      initialValue: false,
      fieldset: 'lifecycle',
    }),
    defineField({
      name: 'replacement',
      title: 'Безопасная замена',
      type: 'reference',
      to: [{ type: 'article' }],
      weak: true,
      fieldset: 'lifecycle',
    }),
    defineField({ name: 'seoTitle', title: 'SEO title override', type: 'string', fieldset: 'seo' }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description override',
      type: 'text',
      rows: 2,
      fieldset: 'seo',
    }),
  ],
  validation: (Rule) =>
    Rule.custom((document) => {
      if (!document || typeof document !== 'object') return true;
      const item = document as Record<string, unknown>;
      const errors: string[] = [];
      if (item.language !== 'ru' && (!item.translatedFrom || !item.sourceMedicalRevision))
        errors.push('Переводу нужны translatedFrom и sourceMedicalRevision.');
      if (item.language === 'ru' && (item.translatedFrom || item.sourceMedicalRevision))
        errors.push('RU-источник не должен иметь translatedFrom или sourceMedicalRevision.');
      if (item.riskLevel === 'HIGH' && !item.reviewedBy)
        errors.push('Для HIGH-risk материала нужен независимый рецензент.');
      if (
        item.riskLevel === 'HIGH' &&
        item.medicalOwner &&
        item.reviewedBy &&
        typeof item.medicalOwner === 'object' &&
        typeof item.reviewedBy === 'object' &&
        (item.medicalOwner as { _ref?: unknown })._ref ===
          (item.reviewedBy as { _ref?: unknown })._ref
      )
        errors.push(
          'Для HIGH-risk материала medicalOwner и reviewedBy должны быть разными авторами.',
        );
      if (item.withdrawn && !item.replacement)
        errors.push('Снятому материалу нужна безопасная замена.');
      if (!Array.isArray(item.body) || item.body.length === 0)
        errors.push('Добавьте содержательный body.');
      return errors.length ? errors.join(' ') : true;
    }),
});
