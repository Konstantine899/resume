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
 * is gone.
 */
export function resolveManualChunk(id: string): string | undefined {
  // Rollup выдаёт posix-id, но нормализуем и backslash-варианты, чтобы правило
  // локалей не зависело от платформы.
  const normalized = id.replace(/\\/g, '/');

  // Локали — в отдельный чанк, чтобы не тянуть JSON в main.
  if (normalized.includes('src/shared/lib/i18n/locales/') && normalized.endsWith('.json')) {
    return 'i18n';
  }
  if (normalized.includes('node_modules/react-hook-form')) {
    return undefined; // lazy /admin/about chunk only
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
