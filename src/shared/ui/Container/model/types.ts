// src/shared/ui/Container/model/types.ts

import type { HTMLAttributes } from 'react';
import type { PolymorphicProps } from '@/shared/lib/types/polymorphic';

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
  asChild?: boolean;
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

// Re-export shared PolymorphicProps for convenience
export type { PolymorphicProps };
