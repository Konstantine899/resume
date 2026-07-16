// src/shared/ui/Container/model/constants.ts

/**
 * Константы для компонента Container
 */
export const CONTAINER_CONSTANTS = {
  /** Допустимые размеры */
  VALID_SIZES: ['sm', 'md', 'lg', 'xl', 'full'] as const,

  /** Допустимые padding значения */
  VALID_PADDING: ['none', 'sm', 'md', 'lg', 'xl'] as const,

  /** Max-width для каждого размера */
  MAX_WIDTH: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
  } as const,

  /** Padding значения */
  PADDING: {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  } as const,

  /** Default values */
  DEFAULT_SIZE: 'lg' as const,
  DEFAULT_CENTERED: true,
  DEFAULT_PADDING: 'md' as const,
} as const;
