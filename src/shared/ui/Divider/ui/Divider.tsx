// src/shared/ui/Divider/ui/Divider.tsx

import { validateDividerProps } from '@/shared/ui/Divider/lib/utils/validateDividerProps';
import { DIVIDER_CONSTANTS } from '@/shared/ui/Divider/model/constants';
import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import type { DividerProps } from '../model/types';
import styles from './Divider.module.scss';

/**
 * Divider Component — визуальный разделитель контента
 *
 * @param orientation - Ориентация разделителя ('horizontal' | 'vertical')
 * @param variant    - Стиль линии ('solid' | 'dashed' | 'dotted')
 * @param thickness  - Толщина линии в px (1-10)
 * @param className  - Дополнительный CSS-класс
 *
 * @example
 * // Basic usage (default: orientation="horizontal", variant="solid")
 * ```tsx
 * <Divider />
 * ```
 *
 * @example
 * // With vertical orientation
 * ```tsx
 * <Divider orientation="vertical" thickness={2} />
 * ```
 *
 * @example
 * // With dashed variant and custom thickness
 * ```tsx
 * <Divider variant="dashed" thickness={3} />
 * ```
 *
 * @example
 * // With accessibility attributes
 * ```tsx
 * <Divider aria-label="Section separator" role="separator" />
 * ```
 *
 * @example
 * // All variants
 * ```tsx
 * <div>
 *   <Divider variant="solid" />
 *   <Divider variant="dashed" />
 *   <Divider variant="dotted" />
 * </div>
 * ```
 */
const DividerComponent = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      variant = 'solid',
      thickness = DIVIDER_CONSTANTS.DEFAULT_THICKNESS,
      className = '',
      ...restProps
    },
    ref
  ) => {
    // Runtime validation in development mode
    useEffect(() => {
      validateDividerProps(orientation, variant, thickness);
    }, [orientation, variant, thickness]);

    // Memoize className calculation
    const dividerClassName = useMemo(
      () => classNames(styles.divider, styles[orientation], styles[variant], className),
      [orientation, variant, className]
    );

    // Memoize style object
    const dividerStyle = useMemo(
      () => ({
        [orientation === 'horizontal' ? 'height' : 'width']: `${thickness}px`,
      }),
      [orientation, thickness]
    );

    return (
      <div
        ref={ref}
        className={dividerClassName}
        style={dividerStyle}
        role="separator"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-variant={variant}
        {...restProps}
      />
    );
  }
);

DividerComponent.displayName = 'Divider';

export const Divider = memo(DividerComponent);
Divider.displayName = 'Divider';
