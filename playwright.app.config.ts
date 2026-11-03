import { defineConfig, devices } from '@playwright/test';

/**
 * App e2e (issue #299) — smoke checks against the production build.
 *
 * SEPARATE from `playwright.config.ts` (Storybook on :6006 — untouched).
 * The build outputs to `public/` (buildViteConfig.build.outDir), and
 * `vite preview` serves it with the SPA fallback (appType defaults to 'spa',
 * never overridden), so deep links like /admin/jobs return index.html and
 * the lazy router resolves the chunk client-side.
 *
 * The preview server does NOT build — `npm run test:app` runs
 * `npm run build` first (the "stale public/" gotcha, resume-axe-stale-build).
 *
 * Port 3002, NOT the vite default 3001: the owner's dev server routinely
 * occupies 3001 (`npm run dev` default), and with reuseExistingServer the
 * suite would silently smoke the DEV server instead of the production
 * preview (resume-skills-actions-polish preview gotcha).
 *
 * NOTE: this file and `e2e/` are NOT in the root tsconfig include
 * (src, .storybook, scripts) — `npm run type-check` intentionally skips
 * them (same precedent as the root `playwright.config.ts`); ESLint's flat
 * config (ts extension glob) still covers them.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,
  expect: {
    // Lazy /admin chunks + store hydration need more than the 5s default.
    timeout: 15000,
  },
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 3002 --strictPort',
    url: 'http://localhost:3002',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
