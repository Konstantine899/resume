import react from '@vitejs/plugin-react';
import { UserConfig } from 'vite';
import { buildPlugins } from './buildPlugins.ts';
import { buildResolvers } from './buildResolvers.ts';
import { buildServer } from './buildServer.ts';
import { buildCssModulesConfig } from './loaders/buildCssModules.ts';
import { BuildOptions } from './types/config.ts';

/**
 * Chunk placement for `build.rollupOptions.output.manualChunks`.
 *
 * The `react` prefix intentionally shadows react-i18next (vendor, as on the
 * baseline build). react-hook-form is deliberately EXCLUDED from vendor: it
 * is imported only by the lazy /admin/about editor, so it rides that route's
 * chunk — the showcase never downloads admin-form code (About CRUD WU-4,
 * human-approved 2026-10-04). Earlier the substring match kept RHF in
 * vendor because the form lived in main; with the form lazy that rationale
 * is gone. zod gets its own chunk AFTER the RHF rule (issue #298): it is
 * statically reachable from main (entity schemas) and used to bloat the
 * shared Overlay chunk; the rule must not swallow @hookform/resolvers/zod,
 * which stays with its lazy admin importer.
 */
export function resolveManualChunk(id: string): string | undefined {
  // Rollup выдаёт posix-id, но нормализуем и backslash-варианты, чтобы правило
  // локалей не зависело от платформы.
  const normalized = id.replace(/\\/g, '/');

  // Локали — в отдельный чанк, чтобы не тянуть JSON в main. ru.json ИСКЛЮЧЁН:
  // он грузится лениво (dynamic import в loadRu, issue #298) и должен уходить
  // в отдельный async-чанк, а не в modulepreload-статику.
  if (
    normalized.includes('src/shared/lib/i18n/locales/') &&
    normalized.endsWith('.json') &&
    !normalized.endsWith('ru.json')
  ) {
    return 'i18n';
  }
  if (normalized.includes('node_modules/react-hook-form')) {
    return undefined; // lazy /admin/about chunk only
  }
  // zod core после RHF-правила (issue #298): zod статически тянется в main
  // через entity-схемы/store, но лежал в свалочном Overlay-чанке (95.7 КБ).
  // Отдельный чанк снимает перегрузку default-лимита. ВАЖНО: строка ниже не
  // матчит @hookform/resolvers/zod (после node_modules/ идёт @hookform) —
  // резолвер остаётся в ленивом админ-чанке вместе с формой.
  if (normalized.includes('node_modules/zod')) {
    return 'zod';
  }
  if (
    normalized.includes('node_modules/react') ||
    normalized.includes('node_modules/react-dom') ||
    normalized.includes('node_modules/scheduler')
  ) {
    return 'vendor';
  }
  if (
    normalized.includes('node_modules/i18next') ||
    normalized.includes('node_modules/react-i18next')
  ) {
    return 'i18n';
  }
}

export function buildViteConfig(options: BuildOptions): UserConfig {
  const { isDev, apiUrl, project } = options;

  return {
    mode: options.mode,
    plugins: [react(), ...buildPlugins(options)],

    resolve: {
      alias: buildResolvers(options),
    },
    server: buildServer(options),
    css: buildCssModulesConfig(options),
    define: {
      __IS_DEV__: JSON.stringify(isDev),
      __API__: JSON.stringify(apiUrl),
      __PROJECT__: JSON.stringify(project),
    },
    build: {
      outDir: 'public',
      assetsDir: 'assets',
      sourcemap: isDev,
      // Инлайним только то, что Vite обязан инлайнить (импорт CSS/JS).
      // Картинки остаются файлами — иначе они раздувают main.js.
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[hash].[ext]',
          manualChunks: resolveManualChunk,
        },
      },
    },
  };
}
