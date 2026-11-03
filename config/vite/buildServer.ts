import { BuildOptions } from './types/config.ts';

export function buildServer(options: BuildOptions) {
  return {
    port: options.port,
    open: true,
    historyApiFallback: true, // Для React Router
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  };
}
