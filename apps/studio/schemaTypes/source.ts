import { defineField, defineType } from 'sanity';

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
      options: { list: ['current', 'superseded', 'withdrawn'] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'supersededBy',
      title: 'Заменён источником',
      type: 'reference',
      to: [{ type: 'source' }],
      weak: true,
    }),
    defineField({ name: 'jurisdiction', title: 'Юрисдикция', type: 'string' }),
    defineField({ name: 'identifier', title: 'DOI / идентификатор', type: 'string' }),
  ],
});
