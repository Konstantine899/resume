// ============================================
// Container Component
// ============================================

import { validateContainerProps } from '@/shared/lib/utils/validateContainerProps';
import { CONTAINER_CONSTANTS } from '@/shared/ui/Container/model/constants';
import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import type { ContainerProps } from '../model/types';
import styles from './Container.module.scss';

/**
 * Container Component — ограничение ширины и центрирование контента
 *
 * @example
 * // Basic usage (default: size="lg", centered=true, padding="md")
 * ```tsx
 * <Container>Content</Container>
 * ```
 *
 * @example
 * // Custom size
 * ```tsx
 * <Container size="xl">Large content</Container>
 * ```
 *
 * @example
 * // Full width with padding
 * ```tsx
 * <Container fullWidth padding="lg">Full width content</Container>
 * ```
 *
 * @example
 * // Without centering
 * ```tsx
 * <Container centered={false}>Left-aligned content</Container>
 * ```
 *
 * @example
 * // With accessibility attributes
 * ```tsx
 * <Container role="region" aria-label="Main content">
 *   <h1>Page Title</h1>
 * </Container>
 * ```
 */
const ContainerComponent = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = CONTAINER_CONSTANTS.DEFAULT_SIZE,
      centered = CONTAINER_CONSTANTS.DEFAULT_CENTERED,
      className = '',
      fullWidth = false,
      padding = CONTAINER_CONSTANTS.DEFAULT_PADDING,
      role,
      'aria-label': ariaLabel,
      ...restProps
    },
    ref
  ) => {
    // Runtime validation in development mode (optimized deps)
    useEffect(() => {
      validateContainerProps(size, padding);
    }, [size, padding]);

    // Memoize className calculation (optimized dependencies)
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
        data-size={size}
        data-padding={padding}
        {...restProps}
      />
    );
  }
);

ContainerComponent.displayName = 'Container';

// Memo wrapper with displayName
export const Container = memo(ContainerComponent);
Container.displayName = 'Container';

export default Container;
