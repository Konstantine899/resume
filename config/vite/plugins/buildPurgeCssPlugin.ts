import purgecss from '@fullhuman/postcss-purgecss';
import type { PluginOption } from 'vite';

export function buildPurgeCssPlugin(isProd: boolean): PluginOption {
  // В dev режиме не применяем PurgeCSS для сохранения HMR производительности
  if (!isProd) {
    return {
      name: 'purgecss-dev-disabled',
      apply: 'serve',
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
              // Пути к файлам с контентом (где используются классы)
              content: ['./src/**/*.{ts,tsx,js,jsx}'],
              // Игнорируем динамические классы и служебные селекторы
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
                ],
                // Паттерны для динамических классов
                greedy: [
                  /^variant-.*/,
                  /^size-.*/,
                  /^status-.*/,
                  /^state-.*/,
                  /^type-.*/,
                  /.*active.*/,
                ],
              },
              // Настройка экстрактора для поддержки CSS Modules и шаблонных строк
              defaultExtractor: (content) => {
                const matches = content.match(/[\w-/:]+(?<!:)/g);
                return matches ? matches : [];
              },
              // Игнорируем keyframes и CSS переменные
              keyframes: false,
              variables: false,
            }),
          ],
        },
      },
    }),
  };
}
