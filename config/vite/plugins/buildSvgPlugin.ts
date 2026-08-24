// config/build/loaders/buildSvgPlugin.ts
import svgr from 'vite-plugin-svgr';

export function buildSvgPlugin() {
  return svgr({
    svgrOptions: {
      exportType: 'default', // Дефолтный экспорт будет React-компонентом
      dimensions: false,
    },
  });
}
