import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';
import { buildCssModulesConfig } from '../config/vite/loaders/buildCssModules';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, '../src') },
          { find: '@app', replacement: path.resolve(__dirname, '../src/app') },
          { find: '@pages', replacement: path.resolve(__dirname, '../src/pages') },
          { find: '@widgets', replacement: path.resolve(__dirname, '../src/widgets') },
          { find: '@features', replacement: path.resolve(__dirname, '../src/features') },
          { find: '@entities', replacement: path.resolve(__dirname, '../src/entities') },
          { find: '@shared', replacement: path.resolve(__dirname, '../src/shared') },
        ],
      },
      css: buildCssModulesConfig({
        isDev: true,
        project: 'storybook',
      } as any),
    });
  },
};

export default config;
