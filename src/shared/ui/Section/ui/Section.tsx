// src/shared/ui/Section/ui/Section.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Container } from '@/shared/ui/Container';
import { forwardRef, memo, useMemo } from 'react';
import { SECTION_CONSTANTS } from '../model/constants';
import type { SectionProps } from '../model/types';
import styles from './Section.module.scss';

/**
 * Runtime validation for Section props (development only)
 */
const validateSectionProps = (
  variant: SectionProps['variant'],
  padding: SectionProps['padding'],
  size: SectionProps['size'],
  as: SectionProps['as']
) => {
  if (process.env.NODE_ENV === 'development') {
    const { VALID_VARIANTS, VALID_PADDING, VALID_SIZES, VALID_AS } = SECTION_CONSTANTS;

    if (variant && !VALID_VARIANTS.includes(variant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Section: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
      );
    }

    if (padding && typeof padding === 'string' && !VALID_PADDING.includes(padding)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Section: invalid padding "${padding}". Valid values: ${VALID_PADDING.join(', ')}`
      );
    }

    if (size && !VALID_SIZES.includes(size)) {
      // eslint-disable-next-line no-console
      console.warn(`Section: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}`);
    }

    if (as && !VALID_AS.includes(as)) {
      // eslint-disable-next-line no-console
      console.warn(`Section: invalid as "${as}". Valid values: ${VALID_AS.join(', ')}`);
    }
  }
};

export const Section = memo(
  forwardRef<HTMLElement, SectionProps>((props, ref) => {
    const {
      as: Component = 'section',
      variant = 'default',
      size = 'lg',
      padding = 'lg',
      margin,
      className = '',
      fullWidth = false,
      overlay = false,
      container = false,
      background,
      textColor,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      children,
      style,
      ...restProps
    } = props;

    // Runtime validation in development mode
    if (process.env.NODE_ENV === 'development') {
      validateSectionProps(variant, padding, size, Component);
    }

    // Memoize inline styles для CSS custom properties
    const customStyles = useMemo(() => {
      const styles: Record<string, string> = {};
      if (background) styles['--section-background'] = background;
      if (textColor) styles['--section-text-color'] = textColor;
      return styles;
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
