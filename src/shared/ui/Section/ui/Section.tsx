// src/shared/ui/Section/ui/Section.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useMemo } from 'react';
import { SECTION_DEFAULTS } from '../model/constants';
import type { SectionProps } from '../model/types';
import { validateSectionProps } from '../lib/utils/validateSectionProps';
import styles from './Section.module.scss';

/**
 * Section — семантический компонент для разделения контента страницы.
 *
 * @description
 * Обеспечивает вертикальный padding через проп size.
 * Горизонтальный padding и max-width управляются через Container.
 * Фон и прочие стили — через className.
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Section>Content</Section>
 * <Section size="lg">Spacious section</Section>
 * <Section as="article">Article section</Section>
 * ```
 */
export const Section = memo(
  forwardRef<HTMLElement, SectionProps>((props, ref) => {
    const {
      as: Component = 'section',
      size = SECTION_DEFAULTS.size,
      className = '',
      children,
      ...restProps
    } = props;

    // Dev-only runtime validation
    validateSectionProps(props);

    // Memoize className
    const sectionClassName = useMemo(
      () => classNames(styles.section, styles[size], className),
      [size, className]
    );

    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={sectionClassName}
        data-size={size}
        {...restProps}
      >
        {children}
      </Component>
    );
  })
);

Section.displayName = 'Section';

export default Section;
