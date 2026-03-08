import react from '@vitejs/plugin-react';
import { UserConfig } from 'vite';
import { buildPlugins } from './buildPlugins';
import { buildResolvers } from './buildResolvers';
import { buildServer } from './buildServer';
import { buildCssModulesConfig } from './loaders/buildCssModules';
import { BuildOptions } from './types/config';

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
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev,
      rollupOptions: {
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[hash].[ext]',
        },
      },
    },
  };
}
