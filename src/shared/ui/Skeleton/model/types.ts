// src/shared/ui/Skeleton/model/types.ts

import type { ComponentPropsWithRef, ElementType, ForwardedRef, ReactNode } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

/** Required ratio prop — AspectRatioString pattern */
export type SkeletonRatioString = `${number}/${number}`;

/** Own props — Skeleton-specific fields only */
export interface SkeletonOwnProps {
  /** @optional — aspect ratio like "16/9" (runtime fallback DEFAULT_RATIO) */
  ratio?: SkeletonRatioString;
  /** Variant */
  variant?: SkeletonVariant;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
  /** Delay before animation starts */
  delay?: number;
  /** Шаг stagger-задержки между строками (multi-line text), диапазон 0-1 */
  staggerStep?: number;
  /** Animation duration */
  duration?: number;
  /** Custom className */
  className?: string;
  /** Loading wrapper — undefined/true → skeleton; false → children */
  loading?: boolean;
  /** Content rendered when loading === false (ignored while skeleton is shown) */
  children?: ReactNode;
}

/** Generic polymorphic props — merges own props with element props */
export type SkeletonProps<C extends ElementType = 'div'> = SkeletonOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof SkeletonOwnProps | 'as' | 'ref'> & { as?: C };

/** Component type for memo-cast */
export type SkeletonComponent = (<C extends ElementType = 'div'>(
  props: SkeletonProps<C> & { ref?: ForwardedRef<HTMLElement> }
) => React.ReactElement) & { displayName?: string };
