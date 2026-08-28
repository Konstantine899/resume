import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// В режиме test.projects Vitest НЕ наследует resolve.alias/plugins с корня —
// каждый проект обязан задавать их самостоятельно.
const alias = { '@': path.resolve(dirname, './src') };

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/tests/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}', '.opencode/plugins/**/*.{test,spec}.{js,ts}'],
          // Playwright-спеки (src/__tests__/*.spec.ts) гоняются через `npx playwright test`,
          // НЕ через vitest — исключаем, чтобы vitest не падал на браузерных тестах.
          exclude: ['src/__tests__/**/*.spec.ts'],
          // Запрет .only в тестах (MINOR: не даёт случайно закоммитить
          // частичный прогон как полный). default: !process.env.CI.
          allowOnly: false,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            thresholds: {
              global: {
                branches: 85,
                functions: 87,
                lines: 92,
                statements: 90,
              },
            },
          },
        },
      },
      {
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'npm run storybook -- --ci',
          }),
        ],
        resolve: { alias },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
