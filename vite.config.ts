import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { buildViteConfig } from './config/vite/buildViteConfig';
import { BuildMode, BuildOptions, BuildPath } from './config/vite/types/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  const paths: BuildPath = {
    src: path.resolve(__dirname, 'src'),
    locales: path.resolve(__dirname, 'src', 'locales'),
    buildLocales: 'locales', // папка назначения внутри dist
    app: path.resolve(__dirname, 'src', 'app'),
    pages: path.resolve(__dirname, 'src', 'pages'),
    entities: path.resolve(__dirname, 'src', 'entities'),
    features: path.resolve(__dirname, 'src', 'features'),
    shared: path.resolve(__dirname, 'src', 'shared'),
    widgets: path.resolve(__dirname, 'src', 'widgets')
  };

  const options: BuildOptions = {
    mode: mode as BuildMode,
    paths,
    isDev,
    port: Number(env.PORT) || 3000,
    project: 'frontend',
    analyze: env.ANALYZE === 'true',
  };

  return buildViteConfig(options);
});
