// src/shared/ui/Section/ui/Section.tsx

import { memo, forwardRef } from 'react';
import { useSection } from '../lib/hooks/useSection';
import type { SectionAsElement } from '../model/types';
import styles from './Section.module.scss';

/**
 * Section — семантический компонент для разделения контента страницы.
 *
 * @remarks
 * **Important notes:**
 * - Provides vertical padding only (top/bottom) — use Container for horizontal padding and max-width
 * - Recommended pattern: `<Section><Container>...</Container></Section>`
 * - Default element: `<section>`. Use `as` prop for other semantic HTML elements
 * - Runtime validation runs ONLY in development mode (`process.env.NODE_ENV === 'development'`)
 * - Size `xxl` renamed from `2xl` to avoid CSS class name issues (classes cannot start with digits)
 *
 * @group UI Components
 *
 * @example
 * // Basic usage (default: size="md", as="section")
 * ```tsx
 * <Section>Content</Section>
 * ```
 *
 * @example
 * // Large section with semantic HTML
 * ```tsx
 * <Section size="lg" as="article">
 *   <h1>Article Title</h1>
 *   <p>Content...</p>
 * </Section>
 * ```
 *
 * @example
 * // Section + Container pattern (recommended)
 * ```tsx
 * <Section size="xl" as="section">
 *   <Container size="lg" centered>
 *     <Card>Content</Card>
 *   </Container>
 * </Section>
 * ```
 *
 * @example
 * // Page layout with multiple sections
 * ```tsx
 * <>
 *   <Section size="sm" as="header"><Header /></Section>
 *   <Section size="xl" as="main"><Main /></Section>
 *   <Section size="md" as="footer"><Footer /></Section>
 * </>
 * ```
 */

interface SectionProps {
  as?: SectionAsElement;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/**
 * Section — layout component for page sections with vertical padding.
 *
 * Defaults to rendering a `<section>` element. Use `as` prop to render as
 * `<div>`, `<article>`, `<aside>`, `<main>`, or `<nav>`.
 */
export const Section = memo(
  forwardRef<HTMLElement, SectionProps>(
    ({ as = 'section', size = 'md', className = '', children, ...restProps }, ref) => {
      const { sectionClassName, dataAttrs } = useSection({ size, className, as });

      // Map logical class parts to CSS module scoped class names
      const Component = as;
      const finalClassName = `${styles.section} ${styles[size]} ${sectionClassName}`;

      const ComponentElement = Component as keyof JSX.IntrinsicElements;

      return (
        <ComponentElement
          ref={ref as React.Ref<HTMLElement>}
          className={finalClassName}
          {...dataAttrs}
          {...restProps}
        >
          {children}
        </ComponentElement>
      );
    }
  )
);

Section.displayName = 'Section';
