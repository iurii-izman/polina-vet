import { defineField, defineType } from 'sanity';

export const species = defineType({
  name: 'species',
  title: 'Вид животных',
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
