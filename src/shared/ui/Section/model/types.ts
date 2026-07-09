// src/shared/ui/Section/model/types.ts

import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Responsive value type для adaptive значений
 * Используется для padding и других свойств которые меняются на разных breakpoint
 */
export type ResponsiveValue<T> = {
  /** Базовое значение (mobile-first) */
  base?: T;
  /** Small breakpoint (640px) */
  sm?: T;
  /** Medium breakpoint (768px) */
  md?: T;
  /** Large breakpoint (1024px) */
  lg?: T;
  /** Extra large breakpoint (1280px) */
  xl?: T;
  /** 2XL breakpoint (1536px) */
  '2xl'?: T;
};

/**
 * Вариант стиля секции
 * @default - Базовый стиль (transparent)
 * @alternate - Альтернативный фон (#f5f5f5)
 * @gradient - Градиентный фон
 * @muted - Приглушённый стиль с borders
 * @dark - Тёмный фон (#1a1a1a)
 * @light - Светлый фон (#ffffff)
 */
export type SectionVariant = 'default' | 'alternate' | 'gradient' | 'muted' | 'dark' | 'light';

/**
 * Размер секции (max-width)
 * @sm - 640px
 * @md - 768px
 * @lg - 1024px
 * @xl - 1280px
 * @2xl - 1536px
 * @full - 100%
 */
export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * Padding размер
 * @none - 0
 * @sm - 1.5rem
 * @md - 2rem
 * @lg - 3rem
 * @xl - 4rem
 * @2xl - 6rem
 */
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Margin для vertical rhythm
 */
export type SectionMarginValue = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Конфигурация margin для vertical rhythm
 */
export interface SectionMargin {
  /** Margin сверху */
  top?: SectionMarginValue;
  /** Margin снизу */
  bottom?: SectionMarginValue;
}

/**
 * Конфигурация Container для integration
 */
export interface ContainerConfig {
  /** Включить Container */
  enabled?: boolean;
  /** Размер Container */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Центрировать контент */
  centered?: boolean;
}

/**
 * Props для компонента Section
 */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Вариант стиля секции */
  variant?: SectionVariant;

  /** Размер секции (max-width) */
  size?: SectionSize;

  /** Padding (responsive support) */
  padding?: SectionPadding | ResponsiveValue<SectionPadding>;

  /** Margin для vertical rhythm */
  margin?: SectionMargin;

  /** Semantic HTML элемент */
  as?: 'section' | 'div' | 'article' | 'aside' | 'main' | 'nav';

  /** Полная ширина (игнорирует size) */
  fullWidth?: boolean;

  /** Overlay эффект (then layer поверх фона) */
  overlay?: boolean;

  /** Container integration */
  container?: boolean | ContainerConfig;

  /** Кастомный background (CSS custom property) */
  background?: string;

  /** Кастомный цвет текста (CSS custom property) */
  textColor?: string;

  /** Дочерние элементы */
  children?: ReactNode;
}
