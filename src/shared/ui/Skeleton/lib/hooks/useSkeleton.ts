// src/shared/ui/Skeleton/lib/hooks/useSkeleton.ts

import { useMemo } from 'react';
import type { CSSProperties, ElementType } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { SkeletonOwnProps } from '../../model/types';
import { SKELETON_DEFAULTS, DEFAULT_RATIO } from '../../model/constants';
import styles from '../../ui/Skeleton.module.scss';

export interface UseSkeletonParams extends SkeletonOwnProps {
  ariaLabel?: string;
  as?: ElementType;
}

export interface UseSkeletonReturn {
  skeletonClassName: string;
  linesArray: Array<{ index: number; isLast: boolean; delay: number }> | null;
  singleLineStyle: CSSProperties;
  lineStyle: (lineDelay: number) => CSSProperties;
  effectiveAriaLabel: string;
  dataAttrs: Record<string, string>;
  resolvedRatio: string;
}

/**
 * useSkeleton hook — consolidates className, lines, style, aria-label, and dataAttrs derivation.
 */
export function useSkeleton({
  ratio,
  variant = SKELETON_DEFAULTS.variant,
  width,
  height,
  lines = SKELETON_DEFAULTS.lines,
  delay = SKELETON_DEFAULTS.delay,
  duration = SKELETON_DEFAULTS.duration,
  staggerStep = SKELETON_DEFAULTS.staggerStep,
  className = '',
  ariaLabel,
  as,
}: UseSkeletonParams): UseSkeletonReturn {
  const resolvedRatio = ratio ?? DEFAULT_RATIO;
  const effectiveAriaLabel = ariaLabel ?? ''; // t('loading') passed from component
  const skeletonClassName = classNames(styles.skeleton, styles[variant], className);

  // Data attributes — data-as only for string components
  const dataAttrs = useMemo(
    () => ({
      'data-aspect-ratio': resolvedRatio,
      ...(typeof as === 'string' && { 'data-as': as }),
      'data-variant': variant,
      ...(lines > 1 && { 'data-lines': String(lines) }),
    }),
    [resolvedRatio, as, variant, lines]
  );

  // Memoize lines array for multi-line text variant
  const linesArray = useMemo(() => {
    if (variant !== 'text' || lines <= 1) {
      return null;
    }

    return Array.from({ length: lines }).map((_, index) => ({
      index,
      isLast: index === lines - 1,
      // Round to 3 decimal places to avoid floating point precision issues
      delay: Math.round((delay + index * staggerStep) * 1000) / 1000,
    }));
  }, [variant, lines, delay, staggerStep]);

  // Memoize style for single-line variant — CSS variables drive the ::after shimmer
  const singleLineStyle = useMemo<CSSProperties>(() => {
    return {
      width,
      height,
      ['--skeleton-duration']: `${duration}s`,
      ['--skeleton-delay']: `${delay}s`,
    };
  }, [width, height, delay, duration]);

  // Line style factory for multi-line
  const lineStyle = useMemo(
    () =>
      (lineDelay: number): CSSProperties =>
        ({
          ['--skeleton-delay']: `${lineDelay}s`,
          ['--skeleton-duration']: `${duration}s`,
        }) as CSSProperties,
    [duration]
  );

  return {
    skeletonClassName,
    linesArray,
    singleLineStyle,
    lineStyle,
    effectiveAriaLabel,
    dataAttrs,
    resolvedRatio,
  };
}
