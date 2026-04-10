import { BuildOptions } from '../types/config';

export function buildCssModulesConfig({ isDev }: BuildOptions) {
  return {
    modules: {
      generateScopedName: isDev ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:8]',
      localsConvention: 'camelCaseOnly' as const,
    },
    preprocessorOptions: {
      scss: {
        // Сюда можно добавить глобальные миксины или переменные, если нужно
        // additionalData: `@import "@/shared/styles/variables.scss";`
      },
    },
  };
}
