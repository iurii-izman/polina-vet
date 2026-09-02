import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'pnpm build && node tests/serve.mjs',
    port: 4321,
    reuseExistingServer: false,
  },
});
