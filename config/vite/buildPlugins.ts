// config/vite/buildPlugins.ts
import { visualizer } from 'rollup-plugin-visualizer';
import { PluginOption } from 'vite';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { buildPurgeCssPlugin } from './plugins/buildPurgeCssPlugin.ts';
import { buildSvgPlugin } from './plugins/buildSvgPlugin.ts';
import { scssUnusedAnalyzer } from './plugins/scssUnusedAnalyzer.ts';
import { BuildOptions } from './types/config.ts';

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

    // 3. Копирование статических файлов (locales + project images)
    // Копируем из src/locales в public/locales и project-изображения
    // из src/shared/assets/images/projects в public/images/projects
    // (дев: через middleware, билд: через writeBundle — план project-images WU-2).
    viteStaticCopy({
      targets: [
        {
          src: paths.locales,
          dest: paths.buildLocales,
        },
        {
          src: paths.imagesProjects,
          dest: paths.buildImagesProjects,
          // Directory src preserves the full matched dir tree in dest
          // (public/images/projects/src/shared/...). stripBase flattens it
          // back to one level so the seed path /images/projects/x.webp
          // resolves both in build and (via fileMap) in the dev server.
          rename: { stripBase: true },
        },
      ],
    }),
  ];

  // Плагины только для продакшена
  if (isProd) {
    // PurgeCSS вырезает неиспользуемые CSS-правила на КАЖДОЙ продакшен-сборке,
    // а не только при ANALYZE=true — иначе `npm run build` отдаёт полный CSS.
    plugins.push(buildPurgeCssPlugin());
  }

  if (isProd && analyze) {
    plugins.push(
      visualizer({
        open: true,
        filename: 'public/stats.html',
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  return plugins.filter(Boolean) as PluginOption[];
}
