// src/shared/ui/Divider/ui/Divider.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useMemo } from 'react';
import { DIVIDER_CONSTANTS } from '../model/constants';
import type { DividerProps } from '../model/types';
import styles from './Divider.module.scss';

/**
 * Runtime validation for Divider props (development only)
 */
const validateDividerProps = (
  orientation: DividerProps['orientation'],
  variant: DividerProps['variant'],
  thickness: DividerProps['thickness']
) => {
  if (process.env.NODE_ENV === 'development') {
    const { VALID_ORIENTATIONS, VALID_VARIANTS, MIN_THICKNESS, MAX_THICKNESS } = DIVIDER_CONSTANTS;

    if (orientation && !VALID_ORIENTATIONS.includes(orientation)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Divider: invalid orientation "${orientation}". Valid values: ${VALID_ORIENTATIONS.join(', ')}`
      );
    }

    if (variant && !VALID_VARIANTS.includes(variant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Divider: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
      );
    }

    if (thickness !== undefined && (thickness < MIN_THICKNESS || thickness > MAX_THICKNESS)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Divider: invalid thickness "${thickness}". Valid range: ${MIN_THICKNESS}-${MAX_THICKNESS}px`
      );
    }
  }
};

export const Divider = memo((props: DividerProps) => {
  const {
    orientation = 'horizontal',
    variant = 'solid',
    thickness = DIVIDER_CONSTANTS.DEFAULT_THICKNESS,
    className = '',
    fullWidth = false,
    fullHeight = false,
    ...restProps
  } = props;

  // Runtime validation in development mode
  if (process.env.NODE_ENV === 'development') {
    validateDividerProps(orientation, variant, thickness);
  }

  // Memoize className calculation
  const dividerClassName = useMemo(
    () =>
      classNames(
        styles.divider,
        styles[orientation],
        styles[variant],
        fullWidth && styles.fullWidth,
        fullHeight && styles.fullHeight,
        className
      ),
    [orientation, variant, fullWidth, fullHeight, className]
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
      className={dividerClassName}
      style={dividerStyle}
      role="separator"
      aria-orientation={orientation}
      {...restProps}
    />
  );
});

Divider.displayName = 'Divider';

export default Divider;
