import { defineArrayMember, defineField, defineType } from 'sanity';

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
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 64 },
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value?.current?.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
            ? true
            : 'Slug может содержать только строчные латинские буквы, цифры и дефисы.',
        ),
    }),
    defineField({ name: 'position', title: 'Должность', type: 'string' }),
    defineField({ name: 'shortBio', title: 'Краткая биография', type: 'text', rows: 4 }),
    defineField({
      name: 'bio',
      title: 'Биография',
      type: 'array',
      of: [defineArrayMember({ type: 'block' })],
    }),
    defineField({
      name: 'education',
      title: 'Образование',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'institution',
              title: 'Учебное заведение',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'field',
              title: 'Направление',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'qualification', title: 'Квалификация', type: 'string' }),
            defineField({ name: 'note', title: 'Примечание', type: 'string' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'portrait',
      title: 'Портрет',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Описание изображения',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
});
