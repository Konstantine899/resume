// src/shared/ui/Container/model/types.ts

import type { HTMLAttributes } from 'react';

/**
 * Размер контейнера
 * @sm - Small (640px)
 * @md - Medium (768px)
 * @lg - Large (1024px)
 * @xl - Extra large (1280px)
 * @full - Full width (100%)
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Padding контейнера
 */
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props для компонента Container (legacy — сохранено для обратной совместимости)
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Размер контейнера (max-width) */
  size?: ContainerSize;

  /** Центрировать контент */
  centered?: boolean;

  /** Кастомный класс */
  className?: string;

  /** Полная ширина (игнорирует size) */
  fullWidth?: boolean;

  /** Padding */
  padding?: ContainerPadding;
}

// ============================================
// Polymorphic + Hook Types
// ============================================

/**
 * Props owned by Container (not inherited from HTML element).
 * Used with PolymorphicProps to enable type-safe polymorphism.
 */
export interface ContainerOwnProps {
  size?: ContainerSize;
  centered?: boolean;
  className?: string;
  fullWidth?: boolean;
  padding?: ContainerPadding;
}

/**
 * Props for the useContainer hook.
 */
export interface ContainerHookProps {
  size?: ContainerSize;
  centered?: boolean;
  className?: string;
  fullWidth?: boolean;
  padding?: ContainerPadding;
}

/**
 * Return type for the useContainer hook.
 */
export interface UseContainerReturn {
  /** Computed className string from CSS modules */
  containerClassName: string;
  /** Data attributes to spread on the element */
  dataAttrs: Record<string, string>;
  /** CSS custom properties style object */
  style: React.CSSProperties & Record<string, string>;
}

/**
 * Generic polymorphic props type for the `component` prop pattern.
 * Allows Container to render as any HTML element or React component
 * while preserving type safety.
 *
 * @template C - The element type to render as (defaults to 'div')
 * @template P - Props owned by the component (take priority over element props)
 */
export type PolymorphicProps<C extends React.ElementType, P = Record<string, never>> = {
  component?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof P> &
  P;
