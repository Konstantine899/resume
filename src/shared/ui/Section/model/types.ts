// src/shared/ui/Section/model/types.ts

import type { ReactNode, ElementType, ComponentPropsWithRef } from 'react';

/**
 * Размер Section (вертикальный padding)
 * @sm - 1.5rem (compact)
 * @md - 2rem (default)
 * @lg - 3rem (spacious)
 * @xl - 4rem
 * @xxl - 6rem (extra spacious) — renamed from '2xl' to avoid CSS class name issues
 */
export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Valid semantic HTML elements for Section
 */
export type SectionAsElement = 'section' | 'div' | 'article' | 'aside' | 'main' | 'nav';

/**
 * Props owned by Section (not inherited from HTML element)
 */
export interface SectionOwnProps {
  /** Размер секции (вертикальный padding) */
  size?: SectionSize;
  /** Semantic HTML элемент */
  as?: SectionAsElement;
  /** Дочерние элементы */
  children?: ReactNode;
  /** Кастомный className */
  className?: string;
}

/**
 * Generic polymorphic props for Section component
 * Allows type-safe ref forwarding based on the `as` prop
 *
 * @template C - The element type to render as (defaults to 'section')
 */
export type SectionProps<C extends ElementType = 'section'> = SectionOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof SectionOwnProps>;

/**
 * Props for the useSection hook
 */
export interface SectionHookProps {
  size?: SectionSize;
  className?: string;
  as?: SectionAsElement;
}

/**
 * Return type for the useSection hook
 */
export interface UseSectionReturn {
  /** Computed className string (logical parts: "section sm custom-class") */
  sectionClassName: string;
  /** Data attributes to spread on the element */
  dataAttrs: Record<string, string>;
}
