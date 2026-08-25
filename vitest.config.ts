import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
