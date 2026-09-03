import { defineField, defineType } from 'sanity';
import { sourceStatuses } from './shared';

export const source = defineType({
  name: 'source',
  title: 'Источник',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    defineField({
      name: 'status',
      title: 'Статус',
      type: 'string',
      options: { list: sourceStatuses, layout: 'radio' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'supersededBy',
      title: 'Заменён источником',
      type: 'reference',
      to: [{ type: 'source' }],
      weak: true,
      hidden: ({ parent }) => parent?.status !== 'superseded',
    }),
    defineField({ name: 'jurisdiction', title: 'Юрисдикция', type: 'string' }),
    defineField({ name: 'identifier', title: 'DOI / идентификатор', type: 'string' }),
  ],
  validation: (Rule) =>
    Rule.custom((document) => {
      const item = document as Record<string, unknown> | undefined;
      return item?.status !== 'superseded' || item?.supersededBy
        ? true
        : 'Заменённому источнику нужен supersededBy.';
    }),
});
