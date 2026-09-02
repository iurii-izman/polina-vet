import { defineField, defineType } from 'sanity';

export const author = defineType({
  name: 'author',
  title: 'Автор',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Имя',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'role', title: 'Роль', type: 'string' }),
  ],
});
