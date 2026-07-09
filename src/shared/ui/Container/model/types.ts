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
 * Props для компонента Container
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
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}
