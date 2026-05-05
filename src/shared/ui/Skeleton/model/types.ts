// src/shared/ui/Skeleton/model/types.ts

import type { HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Вариант скелетона */
  variant?: SkeletonVariant;

  /** Ширина */
  width?: string | number;

  /** Высота */
  height?: string | number;

  /** Количество строк для текстового варианта */
  lines?: number;

  /** Задержка перед началом анимации */
  delay?: number;

  /** Длительность анимации */
  duration?: number;

  /** Кастомный класс */
  className?: string;
}
