// src/shared/ui/AspectRatio/lib/hooks/useAspectRatio.ts

import { useMemo } from 'react';
import type { CSSProperties, ElementType } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { DEFAULT_RATIO } from '@/shared/ui/AspectRatio/model/constants';
import { validateAspectRatioProps } from '@/shared/ui/AspectRatio/lib/utils/validateAspectRatioProps';
import type { AspectRatioString } from '@/shared/ui/AspectRatio/model/types';
import styles from '../../ui/AspectRatio.module.scss';

/**
 * Parameters for the useAspectRatio hook.
 */
export interface UseAspectRatioParams {
  /** Ratio like "16/9". Runtime fallback to DEFAULT_RATIO (AR-03). */
  ratio?: AspectRatioString;
  /** Consumer class merged last into the box className. */
  className?: string;
  /** Resolved polymorphic element ('div' by default). */
  as?: ElementType;
}

/**
 * Return value of useAspectRatio.
 */
export interface UseAspectRatioReturn {
  /** Inline style carrying the canonicalized `aspect-ratio` value. */
  ratioStyle: CSSProperties;
  /** Merged box className (consumer class last). */
  boxClassName: string;
  /** Data attributes for styling/testing. */
  dataAttrs: Record<string, string>;
}

/**
 * Canonicalizes "16/9" → "16 / 9" (spaced) for the inline `aspect-ratio`
 * CSS value. The `data-aspect-ratio` attribute keeps the raw input.
 */
function canonicalRatio(ratio: string): string {
  const [width, height] = ratio.split('/');
  return `${width} / ${height}`;
}

/**
 * AspectRatio hook: computes the inline ratio style, the merged box
 * className and the data attributes (useDivider/useSection pattern).
 *
 * The dev validator runs OUTSIDE the memo (per-invocation guard);
 * the memoized derivation is a pure function of its inputs.
 */
export function useAspectRatio({
  ratio,
  className,
  as,
}: UseAspectRatioParams): UseAspectRatioReturn {
  validateAspectRatioProps({ ratio });

  const resolved = ratio ?? DEFAULT_RATIO;

  return useMemo(() => {
    const ratioStyle: CSSProperties = { aspectRatio: canonicalRatio(resolved) };

    const boxClassName = classNames(styles.box, className);

    const dataAttrs: Record<string, string> = {
      'data-aspect-ratio': resolved,
      ...(typeof as === 'string' && { 'data-as': as }),
    };

    return { ratioStyle, boxClassName, dataAttrs };
  }, [resolved, className, as]);
}
