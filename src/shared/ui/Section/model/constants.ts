// src/shared/ui/Section/model/constants.ts

/**
 * Константы для компонента Section
 */
export const SECTION_CONSTANTS = {
  /** Допустимые варианты стилей */
  VALID_VARIANTS: ['default', 'alternate', 'gradient', 'muted', 'dark', 'light'] as const,

  /** Допустимые padding значения */
  VALID_PADDING: ['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const,

  /** Допустимые размеры */
  VALID_SIZES: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const,

  /** Допустимые semantic элементы */
  VALID_AS: ['section', 'div', 'article', 'aside', 'main', 'nav'] as const,

  /** Допустимые margin значения */
  VALID_MARGIN: ['none', 'sm', 'md', 'lg', 'xl'] as const,

  /** Breakpoints (mobile-first) */
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const,

  /** Padding значения */
  PADDING: {
    none: '0',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '6rem',
  } as const,

  /** Margin значения */
  MARGIN: {
    none: '0',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  } as const,

  /** CSS custom properties для темизации */
  CSS_VARIABLES: {
    background: '--section-background',
    textColor: '--section-text-color',
    default: '--section-default',
    alternate: '--section-alternate',
    alternateDark: '--section-alternate-dark',
    gradient: '--section-gradient',
    gradientStart: '--section-gradient-start',
    gradientEnd: '--section-gradient-end',
    gradientText: '--section-gradient-text',
    gradientFallback: '--section-gradient-fallback',
    muted: '--section-muted',
    mutedDark: '--section-muted-dark',
    dark: '--section-dark',
    darkText: '--section-dark-text',
    light: '--section-light',
    lightText: '--section-light-text',
  } as const,

  /** Container defaults */
  CONTAINER_DEFAULTS: {
    enabled: false,
    size: 'lg',
    centered: true,
  } as const,

  /** Overlay defaults */
  OVERLAY_DEFAULTS: {
    color: 'rgba(0, 0, 0, 0.5)',
  } as const,
} as const;
