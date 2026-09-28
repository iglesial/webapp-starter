import { defineConfig } from '@playwright/test';

// A dedicated port, not Vite's default 5173: with reuseExistingServer, any
// other project's dev server left running on 5173 would be tested instead of
// this app — green or red for reasons that have nothing to do with the code.
// --strictPort makes Vite fail loudly rather than drift to another port.
const PORT = Number(process.env.E2E_PORT ?? 5199);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    // Pin the browser language: the app resolves its locale from
    // navigator.languages when nothing is stored, so a CI runner with a
    // different system language would silently test the wrong language.
    locale: 'en-US',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
