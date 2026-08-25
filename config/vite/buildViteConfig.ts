import react from '@vitejs/plugin-react';
import { UserConfig } from 'vite';
import { buildPlugins } from './buildPlugins.ts';
import { buildResolvers } from './buildResolvers.ts';
import { buildServer } from './buildServer.ts';
import { buildCssModulesConfig } from './loaders/buildCssModules.ts';
import { BuildOptions } from './types/config.ts';

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
      rollupOptions: {
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[hash].[ext]',
          manualChunks(id) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')
            ) {
              return 'vendor';
            }
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n';
            }
            if (
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/zod') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/@emailjs')
            ) {
              return 'forms';
            }
          },
        },
      },
    },
  };
}
