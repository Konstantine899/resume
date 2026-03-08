import { BuildOptions } from './types/config';

export function buildServer(options: BuildOptions) {
  return {
    port: options.port,
    open: true,
    historyApiFallback: true, // Для React Router
  };
}
