// src/shared/ui/Section/model/constants.ts

import { SectionVariant, SectionSize, SectionPadding, SectionMarginValue } from './types';

/**
 * Доступные варианты стилей Section
 */
export const SECTION_VARIANTS: readonly SectionVariant[] = [
  'default',
  'alternate',
  'gradient',
  'muted',
  'dark',
  'light',
] as const;

/**
 * Доступные размеры Section
 */
export const SECTION_SIZES: readonly SectionSize[] = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'full',
] as const;

/**
 * Доступные padding значения
 */
export const SECTION_PADDINGS: readonly SectionPadding[] = [
  'none',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
] as const;

/**
 * Доступные margin значения
 */
export const SECTION_MARGINS: readonly SectionMarginValue[] = [
  'none',
  'sm',
  'md',
  'lg',
  'xl',
] as const;

/**
 * Доступные semantic элементы
 */
export const SECTION_AS: readonly string[] = [
  'section',
  'div',
  'article',
  'aside',
  'main',
  'nav',
] as const;

/**
 * Дефолтные значения props
 */
export const SECTION_DEFAULTS = {
  variant: 'default' as SectionVariant,
  size: 'lg' as SectionSize,
  padding: 'lg' as SectionPadding,
  fullWidth: false,
  overlay: false,
  container: false,
} as const;

/**
 * Grouped constants for Section component
 */
export const SECTION_CONSTANTS = {
  variants: SECTION_VARIANTS,
  sizes: SECTION_SIZES,
  paddings: SECTION_PADDINGS,
  margins: SECTION_MARGINS,
  as: SECTION_AS,
  defaults: SECTION_DEFAULTS,
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  } as const,
  padding: {
    none: '0',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
    '2xl': '6rem',
  } as const,
  margin: {
    none: '0',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  } as const,
  cssVariables: {
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
  containerDefaults: {
    enabled: false,
    size: 'lg',
    centered: true,
  } as const,
  overlayDefaults: {
    color: 'rgba(0, 0, 0, 0.5)',
  } as const,
} as const;
