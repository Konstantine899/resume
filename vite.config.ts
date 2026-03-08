import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { buildViteConfig } from './config/build/buildViteConfig';
import { BuildMode, BuildOptions, BuildPath } from './config/build/types/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  const paths: BuildPath = {
    src: path.resolve(__dirname, 'src'),
    locales: path.resolve(__dirname, 'src', 'locales'),
    buildLocales: 'locales', // папка назначения внутри dist
  };

  const options: BuildOptions = {
    mode: mode as BuildMode,
    paths,
    isDev,
    port: Number(env.PORT) || 3000,
    apiUrl: env.API_URL || 'http://localhost:8000',
    project: 'frontend',
    analyze: env.ANALYZE === 'true',
  };

  return buildViteConfig(options);
});
