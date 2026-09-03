import { defineArrayMember, defineField, defineType } from 'sanity';

const contactFields = [
  defineField({ name: 'primaryPhone', title: 'Основной телефон', type: 'string' }),
  defineField({ name: 'secondaryPhone', title: 'Дополнительный телефон', type: 'string' }),
  defineField({ name: 'telegramHandle', title: 'Telegram', type: 'string' }),
  defineField({ name: 'whatsappPhone', title: 'WhatsApp', type: 'string' }),
  defineField({ name: 'viberPhone', title: 'Viber', type: 'string' }),
];

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
    defineField({
      name: 'primaryAuthor',
      title: 'Основной автор',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({ name: 'contacts', title: 'Контакты', type: 'object', fields: contactFields }),
    defineField({
      name: 'location',
      title: 'Место работы',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Название', type: 'string' }),
        defineField({ name: 'mapUrl', title: 'Ссылка на карту', type: 'url' }),
      ],
    }),
    defineField({
      name: 'serviceModes',
      title: 'Форматы обращения',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Личное обращение', value: 'personalInquiry' },
          { title: 'Приём', value: 'appointment' },
          { title: 'Выезд', value: 'fieldVisit' },
        ],
      },
    }),
    defineField({
      name: 'availabilityNote',
      title: 'Пояснение о доступности',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'featuredKnowledge',
      title: 'Избранные материалы',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'article' }] })],
      validation: (Rule) => Rule.max(3),
    }),
  ],
});
