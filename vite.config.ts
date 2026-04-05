import path from 'path';
import { defineConfig, loadEnv, normalizePath } from 'vite';
import { buildViteConfig } from './config/vite/buildViteConfig';
import { BuildMode, BuildOptions, BuildPath } from './config/vite/types/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  const paths: BuildPath = {
    src:normalizePath (path.resolve(__dirname, 'src')) ,
    locales:normalizePath (path.resolve(__dirname, 'src', 'shared', 'lib', 'locales')) ,
    buildLocales:normalizePath (path.resolve(__dirname, 'public', 'locales')),
    app:normalizePath (path.resolve(__dirname, 'src', 'app')) ,
    pages:normalizePath (path.resolve(__dirname, 'src', 'pages')) ,
    entities:normalizePath (path.resolve(__dirname, 'src', 'entities')) ,
    features:normalizePath (path.resolve(__dirname, 'src', 'features')) ,
    shared:normalizePath (path.resolve(__dirname, 'src', 'shared')) ,
    widgets:normalizePath (path.resolve(__dirname, 'src', 'widgets'))
  };

  const options: BuildOptions = {
    mode: mode as BuildMode,
    paths,
    isDev,
    port: Number(env.PORT) || 3001,
    project: 'frontend',
    analyze: env.ANALYZE === 'true',
  };

  return buildViteConfig(options);
});
