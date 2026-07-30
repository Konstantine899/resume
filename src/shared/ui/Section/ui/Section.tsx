// src/shared/ui/Section/ui/Section.tsx

import { memo, forwardRef } from 'react';
import type { ElementType, ComponentPropsWithRef, ForwardedRef } from 'react';
import { useSection } from '../lib/hooks/useSection';
import type { SectionOwnProps, SectionAsElement } from '../model/types';
import styles from './Section.module.scss';

/**
 * Section — семантический компонент для разделения контента страницы.
 */
type SectionComponent = <C extends ElementType = 'section'>(
  props: SectionOwnProps & Omit<ComponentPropsWithRef<C>, keyof SectionOwnProps>
) => React.ReactElement;

const SectionComponent = memo(
  forwardRef(function SectionImpl<C extends ElementType = 'section'>(
    props: SectionOwnProps & Omit<ComponentPropsWithRef<C>, keyof SectionOwnProps>,
    ref: ForwardedRef<HTMLElement>
  ) {
    const { as, size = 'md', className = '', children, ...restProps } = props;
    const Component = (as || 'section') as C;

    const { sectionClassName, dataAttrs } = useSection({
      size: size as SectionOwnProps['size'],
      className,
      as: (as || 'section') as SectionAsElement,
    });

    const finalClassName = `${styles.section} ${styles[size || 'md']} ${sectionClassName}`;

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={finalClassName}
        {...dataAttrs}
        {...restProps}
      >
        {children}
      </Component>
    );
  }) as unknown as SectionComponent
);

SectionComponent.displayName = 'Section';

export const Section = SectionComponent;
