import { defineArrayMember, defineField, defineType } from 'sanity';

const itemsField = defineField({
  name: 'items',
  title: 'Пункты',
  type: 'array',
  of: [defineArrayMember({ type: 'string' })],
  validation: (Rule) => Rule.required().min(1),
});
const titleField = defineField({
  name: 'title',
  title: 'Заголовок',
  type: 'string',
  validation: (Rule) => Rule.required(),
});

export const practicalActions = defineType({
  name: 'practicalActions',
  title: 'Что можно сделать',
  type: 'object',
  fields: [titleField, itemsField],
});
export const dontDoBlock = defineType({
  name: 'dontDoBlock',
  title: 'Чего не делать',
  type: 'object',
  fields: [titleField, itemsField],
});
export const redFlagCategory = defineType({
  name: 'redFlagCategory',
  title: 'Категория признаков для срочной помощи',
  type: 'object',
  fields: [
    titleField,
    defineField({ name: 'description', title: 'Описание', type: 'text', rows: 3 }),
    itemsField,
  ],
});
export const checklist = defineType({
  name: 'checklist',
  title: 'Чек-лист',
  type: 'object',
  fields: [titleField, itemsField],
});
export const nextSteps = defineType({
  name: 'nextSteps',
  title: 'Следующие шаги',
  type: 'object',
  fields: [titleField, itemsField],
});
export const safetyNotice = defineType({
  name: 'safetyNotice',
  title: 'Safety notice',
  type: 'object',
  fields: [
    titleField,
    defineField({
      name: 'text',
      title: 'Текст',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
});

export const medicalBlockTypes = [
  practicalActions,
  dontDoBlock,
  redFlagCategory,
  checklist,
  nextSteps,
  safetyNotice,
];
