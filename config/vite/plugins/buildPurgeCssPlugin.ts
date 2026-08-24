import purgecss from '@fullhuman/postcss-purgecss';
import type { PluginOption } from 'vite';

export function buildPurgeCssPlugin(isDev: boolean): PluginOption {
  // В dev режиме не применяем PurgeCSS для сохранения HMR производительности
  if (isDev) {
    return {
      name: 'purgecss-dev-disabled',
      apply: 'build',
    };
  }

  return {
    name: 'vite-plugin-purgecss',
    apply: 'build',
    enforce: 'post',
    config: () => ({
      css: {
        postcss: {
          plugins: [
            purgecss({
              // ✅ Пути к контенту
              content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html'],
              // ✅ Safelist для тем и динамических классов
              safelist: {
                standard: [
                  // Глобальные классы тем
                  'dark',
                  'light',
                  'theme-dark',
                  'theme-light',
                  // Базовые HTML элементы
                  'body',
                  'html',
                  '__variable-font__',
                  'root',
                  /emailjs-.*/,
                ],
                // Паттерны для динамических классов
                greedy: [
                  /^variant-.*/,
                  /^size-.*/,
                  /^status-.*/,
                  /^state-.*/,
                  /^type-.*/,
                  /.*active.*/,
                  /.*hover.*/,
                  /.*focus.*/,
                ],
              },
              // Настройка экстрактора для поддержки CSS Modules и шаблонных строк
              defaultExtractor: (content) => {
                const matches = content.match(/[\w-/:]+(?<!:)/g);
                const objectMatches = content.match(/styles\[['"]([^'"]+)['"]\]/g) || [];

                return matches
                  ? [...matches, ...objectMatches.map((m) => m.replace(/styles\[['"]|['"]\]/g, ''))]
                  : [];
              },
              // Игнорируем keyframes и CSS переменные
              keyframes: false,
              variables: false,
              // 🆕 Для внутренней отладки (не выводится в консоль)
              rejected: true,
            }),
          ],
        },
      },
    }),
  };
}
