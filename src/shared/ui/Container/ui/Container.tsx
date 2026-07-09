// src/shared/ui/Container/ui/Container.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useMemo } from 'react';
import { CONTAINER_CONSTANTS } from '../model/constants';
import type { ContainerProps } from '../model/types';
import styles from './Container.module.scss';

/**
 * Runtime validation for Container props (development only)
 */
const validateContainerProps = (
  size: ContainerProps['size'],
  padding: ContainerProps['padding']
) => {
  if (process.env.NODE_ENV === 'development') {
    const { VALID_SIZES, VALID_PADDING } = CONTAINER_CONSTANTS;

    if (size && !VALID_SIZES.includes(size)) {
      // eslint-disable-next-line no-console
      console.warn(`Container: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}`);
    }

    if (padding && !VALID_PADDING.includes(padding)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Container: invalid padding "${padding}". Valid values: ${VALID_PADDING.join(', ')}`
      );
    }
  }
};

export const Container = memo(
  forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
    const {
      size = 'lg',
      centered = true,
      className = '',
      fullWidth = false,
      padding = 'md',
      role,
      'aria-label': ariaLabel,
      ...restProps
    } = props;

    // Runtime validation in development mode
    if (process.env.NODE_ENV === 'development') {
      validateContainerProps(size, padding);
    }

    // Memoize className calculation
    const containerClassName = useMemo(
      () =>
        classNames(
          styles.container,
          styles[size],
          styles[`padding-${padding}`],
          centered && styles.centered,
          fullWidth && styles.fullWidth,
          className
        ),
      [size, centered, fullWidth, padding, className]
    );

    return (
      <div
        ref={ref}
        className={containerClassName}
        role={role}
        aria-label={ariaLabel}
        {...restProps}
      />
    );
  })
);

Container.displayName = 'Container';

export default Container;
