import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import previewConfig from './astro.preview.config.mjs';

export default defineConfig({
  ...previewConfig,
  adapter: cloudflare({ configPath: './wrangler.preview.jsonc' }),
});
