// src/shared/ui/Section/ui/Section.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Container } from '@/shared/ui/Container';
import { forwardRef, memo, useMemo } from 'react';
import { SECTION_DEFAULTS } from '../model/constants';
import type { SectionProps } from '../model/types';
import { validateSectionProps } from '../lib/utils/validateSectionProps';
import styles from './Section.module.scss';

/**
 * Section — семантический компонент для разделения контента страницы.
 *
 * @description
 * Поддерживает варианты (default, alternate, gradient, muted, dark, light),
 * размеры (max-width), responsive padding, vertical rhythm (margin),
 * as-полиморфизм, Container integration, overlay эффект.
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Section>Content</Section>
 * <Section variant="gradient" padding="2xl">Hero section</Section>
 * <Section variant="dark" container>Dark section with container</Section>
 * <Section margin={{ top: 'lg', bottom: 'xl' }}>Section with spacing</Section>
 * ```
 */
export const Section = memo(
  forwardRef<HTMLElement, SectionProps>((props, ref) => {
    const {
      as: Component = 'section',
      variant = SECTION_DEFAULTS.variant,
      size = SECTION_DEFAULTS.size,
      padding = SECTION_DEFAULTS.padding,
      margin,
      className = '',
      fullWidth = SECTION_DEFAULTS.fullWidth,
      overlay = SECTION_DEFAULTS.overlay,
      container = SECTION_DEFAULTS.container,
      background,
      textColor,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      children,
      style,
      ...restProps
    } = props;

    // Runtime validation inline
    if (process.env.NODE_ENV === 'development') {
      validateSectionProps(props);
    }

    // Memoize inline styles для CSS custom properties
    const customStyles = useMemo(() => {
      const cssStyles: Record<string, string> = {};
      if (background) cssStyles['--section-background'] = background;
      if (textColor) cssStyles['--section-text-color'] = textColor;
      return cssStyles;
    }, [background, textColor]);

    // Memoize margin classes
    const marginClasses = useMemo(() => {
      if (!margin) return '';
      return classNames(
        margin.top && styles[`margin-top-${margin.top}`],
        margin.bottom && styles[`margin-bottom-${margin.bottom}`]
      );
    }, [margin]);

    // Memoize className
    const sectionClassName = useMemo(
      () =>
        classNames(
          styles.section,
          styles[variant],
          styles[size],
          typeof padding === 'string'
            ? styles[`padding-${padding}`]
            : styles[`padding-${padding.base || 'md'}`],
          fullWidth && styles.fullWidth,
          overlay && styles.overlay,
          marginClasses,
          className
        ),
      [variant, size, padding, fullWidth, overlay, marginClasses, className]
    );

    // Container integration
    const content = container ? (
      <Container
        size={typeof container === 'object' ? container.size : 'lg'}
        centered={typeof container === 'object' ? container.centered : true}
        className={styles.sectionInner}
      >
        {children}
      </Container>
    ) : (
      children
    );

    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={sectionClassName}
        style={{ ...customStyles, ...style }}
        data-variant={variant}
        data-size={size}
        data-padding={typeof padding === 'string' ? padding : padding.base || 'md'}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...restProps}
      >
        {content}
      </Component>
    );
  })
);

Section.displayName = 'Section';

export default Section;
