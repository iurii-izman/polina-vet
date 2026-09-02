import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Настройки сайта',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название сайта',
      type: 'string',
      initialValue: 'POLINA VET',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultLanguage',
      title: 'Основной язык',
      type: 'string',
      initialValue: 'ru',
      validation: (Rule) => Rule.required(),
    }),
  ],
});
