// src/shared/ui/Section/ui/Section.tsx

import { memo, forwardRef } from 'react';
import type { ElementType, ComponentPropsWithRef, ForwardedRef } from 'react';
import { useSection } from '../lib/hooks/useSection';
import type { SectionOwnProps } from '../model/types';
import styles from './Section.module.scss';

/**
 * Section — семантический компонент для разделения контента страницы.
 *
 * @remarks
 * **Important notes:**
 * - Provides vertical padding only (top/bottom) — use Container for horizontal padding and max-width
 * - Recommended pattern: `<Section><Container>...</Container></Section>`
 * - Default element: `<section>`. Use `as` prop for other semantic HTML elements
 * - Runtime validation runs ONLY in development mode
 * - Size `xxl` renamed from `2xl` to avoid CSS class name issues
 */

type SectionProps<C extends ElementType = 'section'> = SectionOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof SectionOwnProps>;

type SectionComponent = <C extends ElementType = 'section'>(
  props: SectionProps<C> & { ref?: ForwardedRef<HTMLElement> }
) => React.ReactElement;

const SectionComponent = memo(
  forwardRef(function SectionImpl<C extends ElementType = 'section'>(
    { as = 'section', size = 'md', className = '', children, ...restProps }: SectionProps<C>,
    ref: ForwardedRef<HTMLElement>
  ): React.ReactElement {
    const { sectionClassName, dataAttrs } = useSection({
      size,
      className,
      as: as as SectionOwnProps['as'],
    });

    const finalClassName = `${styles.section} ${styles[size]} ${sectionClassName}`;

    const Component = as as ElementType;

    return (
      <Component ref={ref} className={finalClassName} {...dataAttrs} {...restProps}>
        {children}
      </Component>
    );
  }) as unknown as SectionComponent
);

SectionComponent.displayName = 'Section';

/**
 * Section — layout component for page sections with vertical padding.
 *
 * Defaults to rendering a `<section>` element. Use `as` prop to render as
 * `<div>`, `<article>`, `<aside>`, `<main>`, or `<nav>`.
 */
export const Section = SectionComponent;
