// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';
import { buildResolvers } from '../config/vite/buildResolvers';
import { buildCssModulesConfig } from '../config/vite/loaders/buildCssModules';
import { buildSvgPlugin } from '../config/vite/plugins/buildSvgPlugin';

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
        alias: buildResolvers({
          paths: {
            src: path.resolve(__dirname, '../src'),
            app: path.resolve(__dirname, '../src/app'),
            pages: path.resolve(__dirname, '../src/pages'),
            widgets: path.resolve(__dirname, '../src/widgets'),
            features: path.resolve(__dirname, '../src/features'),
            entities: path.resolve(__dirname, '../src/entities'),
            shared: path.resolve(__dirname, '../src/shared'),
            locales: path.resolve(__dirname, '../src/shared/lib/i18n/locales'),
            buildLocales: path.resolve(__dirname, '../public/locales'),
          },
        } as any),
      },
      plugins: [
        // Добавить SVGR для SVG в stories
        buildSvgPlugin(),
      ],
      // CSS конфигурация (без additionalData чтобы не ломать порядок @use/@forward)
      css: buildCssModulesConfig({
        isDev: true,
        project: 'storybook',
      } as any),
      define: {
        __IS_DEV__: 'true',
        __API__: '""',
        __PROJECT__: '"storybook"',
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react'],
      },
    });
  },
};

export default config;
