// ============================================
// Container Component — polymorphic, uses useContainer hook
// ============================================

import React, { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { ContainerOwnProps, PolymorphicProps } from '../model/types';
import { CONTAINER_CONSTANTS } from '../model/constants';
import { useContainer } from '../lib/hooks/useContainer';
import styles from './Container.module.scss';

/**
 * Container Component — ограничение ширины и центрирование контента
 *
 * @remarks
 * **Important notes:**
 * - Runtime validation runs ONLY in development mode (`process.env.NODE_ENV === 'development'`)
 * - When `fullWidth={true}`, the `size` prop is ignored (max-width: 100%)
 * - Uses CSS custom properties: `--container-max-width` and `--container-padding` (set by useContainer hook)
 * - Default element: `<div>`. Use `as` prop for semantic HTML (`<section>`, `<article>`, `<main>`, etc.)
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
 * // As a semantic section element
 * ```tsx
 * <Container as="section" aria-label="Main content">
 *   <h1>Page Title</h1>
 * </Container>
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
 *   Content
 * </Container>
 * ```
 */
function ContainerImpl<T extends React.ElementType = 'div'>(
  {
    as,
    size = CONTAINER_CONSTANTS.DEFAULT_SIZE,
    centered = CONTAINER_CONSTANTS.DEFAULT_CENTERED,
    className = '',
    fullWidth = false,
    padding = CONTAINER_CONSTANTS.DEFAULT_PADDING,
    style: userStyle,
    ...restProps
  }: PolymorphicProps<T, ContainerOwnProps>,
  ref: React.ForwardedRef<React.ComponentRef<T>>
) {
  const {
    containerClassName: logicalClasses,
    dataAttrs,
    style: hookStyle,
  } = useContainer({
    size,
    centered,
    fullWidth,
    padding,
    className,
  });

  // Map logical class parts to CSS module scoped class names
  const containerClassName = useMemo(
    () =>
      classNames(
        styles.container,
        styles[size],
        styles[`padding-${padding}`],
        centered && styles.centered,
        fullWidth && styles.fullWidth,
        logicalClasses
      ),
    [size, centered, fullWidth, padding, logicalClasses]
  );

  const mergedStyle = { ...hookStyle, ...userStyle } as React.CSSProperties;
  const Tag = as || ('div' as React.ElementType);

  return (
    <Tag
      ref={ref as React.Ref<React.ComponentRef<T>>}
      className={containerClassName}
      {...dataAttrs}
      style={mergedStyle}
      {...restProps}
    />
  ) as React.ReactElement;
}

ContainerImpl.displayName = 'Container';

type ContainerComponent = <C extends React.ElementType = 'div'>(
  props: PolymorphicProps<C, ContainerOwnProps> & {
    ref?: React.ForwardedRef<React.ComponentRef<C>>;
  }
) => React.ReactElement;

/**
 * Container — layout component for limiting width and centering content.
 *
 * Defaults to rendering a `<div>` element. Use `as` to render as
 * `<section>`, `<article>`, `<main>`, or any other HTML element / React component.
 */
const MemoContainer = React.memo(
  ContainerImpl as React.FC<PolymorphicProps<React.ElementType, ContainerOwnProps>>
);

export const Container = MemoContainer as ContainerComponent & { displayName: string };
Container.displayName = 'Container';
