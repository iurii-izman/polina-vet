import { defineArrayMember, defineField } from 'sanity';

function validPortableTextHref(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() !== value || !value) return false;
  if ((value.startsWith('/') && !value.startsWith('//')) || value.startsWith('#')) return true;
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const portableTextBlock = defineArrayMember({
  type: 'block',
  marks: {
    annotations: [
      defineArrayMember({
        name: 'link',
        title: 'Ссылка',
        type: 'object',
        fields: [
          defineField({
            name: 'href',
            title: 'Адрес',
            type: 'string',
            validation: (Rule) =>
              Rule.required().custom((value) =>
                validPortableTextHref(value)
                  ? true
                  : 'Разрешены только внутренние пути, фрагменты и абсолютные HTTPS-ссылки.',
              ),
          }),
        ],
      }),
    ],
  },
});
