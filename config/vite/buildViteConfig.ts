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
 * Order matters: the `react`-prefixed rule intentionally shadows
 * `react-hook-form` and `react-i18next` (both already ship in `vendor`).
 * Tightening that match would move modules out of `vendor` and into `main`,
 * which is the chunk that has the least headroom against the bundle budget.
 */
export function resolveManualChunk(id: string): string | undefined {
  // Rollup выдаёт posix-id, но нормализуем и backslash-варианты, чтобы правило
  // локалей не зависело от платформы.
  const normalized = id.replace(/\\/g, '/');

  // Локали — в отдельный чанк, чтобы не тянуть JSON в main.
  if (normalized.includes('src/shared/lib/i18n/locales/') && normalized.endsWith('.json')) {
    return 'i18n';
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
