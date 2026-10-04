import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
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
          include: [
            'src/**/*.{test,spec}.{ts,tsx}',
            'config/**/*.{test,spec}.{ts,tsx}',
            // SSOT-инвариант и тесты генератора срезов (scripts/, Этапы 0–1).
            'scripts/**/*.{test,spec}.{ts,tsx,mjs}',
            '.opencode/plugins/**/*.{test,spec}.{js,ts}',
            // Тесты ESLint-плагина FSD (OPEN-3): иначе tracked .test.js никогда
            // не исполняется и импортирует gitignored-дубль плагина.
            '.opencode/eslint/**/*.{test,spec}.{js,ts}',
          ],
          // Playwright-спеки (src/__tests__/*.spec.ts) гоняются через `npx playwright test`,
          // НЕ через vitest — исключаем, чтобы vitest не падал на браузерных тестах.
          exclude: ['src/__tests__/**/*.spec.ts'],
          // Запрет .only в тестах (MINOR: не даёт случайно закоммитить
          // частичный прогон как полный). default: !process.env.CI.
          allowOnly: false,
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
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
            // Vitest's defaultBrowserPort 63315 sits inside this machine's
            // Hyper-V excluded range (63298-63397) -> EACCES on bind. 48315 is
            // below the Windows dynamic range (49152+) and outside every
            // excluded range, so it stays bindable across reboots.
            api: { port: 48315 },
          },
        },
      },
    ],
    // `test.coverage` — корневая опция: внутри `projects[]` она МОЛЧА игнорируется
    // (проверено: при per-project-блоке Vitest не применял ни `reporter`,
    // ни `exclude`, ни `thresholds` — в coverage/ писался дефолтный clover.xml).
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // Тесты конфигурации сборки живут в config/ и не должны входить в
      // coverage-бюджет приложения (src/**) — иначе пороги падают из-за
      // неописанного конфиг-кода, а не из-за тестов самого приложения.
      // Паттерн `**/`-prefixed: Vitest сопоставляет exclude с абсолютным путём.
      exclude: [
        '**/config/vite/**',
        '**/coverage/**',
        '**/dist/**',
        '**/public/**',
        // scripts/ — утилиты сборки/аналитики, не код приложения: их импорт
        // из конфиг-тестов не должен двигать глобальные coverage-пороги.
        '**/scripts/**',
        // .opencode/eslint — ESLint-плагин (тулинг, не код приложения): после
        // подключения его тестов (OPEN-3) файл плагина начал инструментироваться
        // и тянул бы глобальные пороги вниз без отношения к качеству src/.
        '**/.opencode/eslint/**',
      ],
      // Vitest 4 трактует любой НЕ-метрический ключ внутри `thresholds`
      // как glob по файлам, поэтому вложенный блок `global: {...}`
      // молча матчил ни одного файла и не проверял ничего.
      // Глобальный порог задаётся верхнеуровневыми ключами метрик.
      thresholds: {
        branches: 85,
        functions: 87,
        lines: 92,
        statements: 90,
      },
    },
  },
});
