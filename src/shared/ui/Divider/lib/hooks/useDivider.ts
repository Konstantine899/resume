// src/shared/ui/Divider/lib/hooks/useDivider.ts

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { DIVIDER_CONSTANTS } from '@/shared/ui/Divider/model/constants';
import { validateDividerProps } from '@/shared/ui/Divider/lib/utils/validateDividerProps';
import type { DividerOrientation, DividerVariant } from '@/shared/ui/Divider/model/types';
import styles from '../../ui/Divider.module.scss';

/**
 * Parameters for the useDivider hook.
 */
interface UseDividerParams {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: number;
  className?: string;
  /** true when a non-empty children is present (text divider) */
  hasChildren?: boolean;
}

/**
 * Return value of useDivider.
 */
interface UseDividerReturn {
  dividerClassName: string;
  dataAttrs: Record<string, string>;
  style: CSSProperties;
}

/**
 * Divider hook: computes the className, data-attributes and inline style.
 *
 * The line geometry (thickness, dash/dot scaling) is computed here because
 * SCSS cannot multiply custom properties.
 */
export function useDivider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = DIVIDER_CONSTANTS.DEFAULT_THICKNESS,
  className = '',
  hasChildren = false,
}: UseDividerParams): UseDividerReturn {
  // Defensive dev-only validation (useHeading/useParagraph pattern).
  validateDividerProps(orientation, variant, thickness);

  const isTextDivider = hasChildren && orientation === 'horizontal';

  return useMemo(() => {
    const dividerClassName = classNames(
      styles.divider,
      styles[orientation],
      styles[variant],
      isTextDivider ? styles.textDivider : null,
      className
    );

    const dataAttrs: Record<string, string> = {
      'data-orientation': orientation,
      'data-variant': variant,
    };

    let style: CSSProperties = {};

    if (!isTextDivider && orientation === 'horizontal') {
      // Pure line (horizontal): thickness is drawn via border-top-width,
      // not via the box height (thickness bug fix).
      style = { borderTopWidth: `${thickness}px` };
    } else if (!isTextDivider && orientation === 'vertical') {
      // Vertical line: width + dash/dot pattern scaling.
      const verticalStyle: CSSProperties = { width: `${thickness}px` };
      if (variant === 'dashed') {
        verticalStyle.backgroundSize = `100% ${thickness * 8}px`;
      } else if (variant === 'dotted') {
        verticalStyle.backgroundSize = `100% ${thickness}px`;
      }
      style = verticalStyle;
    }
    // Text divider: the container draws no own line — ::before/::after
    // pseudo-elements draw the line segments around the label.

    return { dividerClassName, dataAttrs, style, isTextDivider };
  }, [orientation, variant, thickness, className, isTextDivider]);
}
