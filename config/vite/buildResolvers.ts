import { Alias } from 'vite';
import { BuildOptions } from './types/config';

export function buildResolvers(options: BuildOptions): Alias[] {
  return [
    // Базовый алиас @ -> src
    { find: '@', replacement: options.paths.src },

    // Алиасы для слоев FSD (для краткости импортов)
    // Пример: import { Button } from '@shared/ui/Button'
    { find: '@app', replacement: options.paths.app },
    { find: '@pages', replacement: options.paths.pages },
    { find: '@widgets', replacement: options.paths.widgets },
    { find: '@features', replacement: options.paths.features },
    { find: '@entities', replacement: options.paths.entities },
    { find: '@shared', replacement: options.paths.shared },
  ];
}
