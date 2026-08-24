// config/vite/buildPlugins.ts
import { visualizer } from 'rollup-plugin-visualizer';
import { PluginOption } from 'vite';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { buildPurgeCssPlugin } from './plugins/buildPurgeCssPlugin';
import { buildSvgPlugin } from './plugins/buildSvgPlugin';
import { scssUnusedAnalyzer } from './plugins/scssUnusedAnalyzer';
import { BuildOptions } from './types/config';

export function buildPlugins(options: BuildOptions): PluginOption[] {
  const { isDev, paths, analyze } = options;
  const isProd = !isDev;

  const plugins: PluginOption[] = [
    // 1. Обработка SVG
    buildSvgPlugin(),

    // 2. Проверка типов TypeScript и ESLint в отдельном потоке
    checker({
      typescript: true,
      eslint: undefined,
      overlay: {
        initialIsOpen: false,
      },
    }),

    // 3. ✅ SCSS Analyzer - только в dev для скорости
    scssUnusedAnalyzer({
      srcPath: paths.src,
      isDev,
    }),

    // 3. Копирование статических файлов (locales)
    // Копируем из src/locales в public/locales
    viteStaticCopy({
      targets: [
        {
          src: paths.locales,
          dest: paths.buildLocales,
        },
      ],
    }),
  ];

  // Плагины только для продакшена
  if (isProd && analyze) {
    plugins.push(
      visualizer({
        open: true,
        filename: 'public/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    );
    plugins.push(buildPurgeCssPlugin(isDev));
  }

  return plugins.filter(Boolean) as PluginOption[];
}
