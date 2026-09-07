import { defineField, defineType } from 'sanity';
import { languages } from './shared';
import { portableTextBlock } from './portableText';

export const page = defineType({
  name: 'page',
  title: 'Страница',
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
      options: { source: 'title' },
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
    defineField({ name: 'body', title: 'Текст', type: 'array', of: [portableTextBlock] }),
  ],
});
