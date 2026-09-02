// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['ru', 'ro', 'uk'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: true },
  },
});
