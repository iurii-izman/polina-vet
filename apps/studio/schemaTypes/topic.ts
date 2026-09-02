import { defineField, defineType } from 'sanity';

export const topic = defineType({
  name: 'topic',
  title: 'Тема',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Название',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'labels',
      title: 'Локализованные названия',
      type: 'object',
      fields: [
        { name: 'ru', type: 'string' },
        { name: 'ro', type: 'string' },
        { name: 'uk', type: 'string' },
      ],
    }),
  ],
});
