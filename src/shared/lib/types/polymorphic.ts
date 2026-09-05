// ============================================
// Shared Polymorphic Types
// ============================================

import type { ComponentPropsWithoutRef, ElementType, ForwardedRef, ReactElement } from 'react';

/**
 * Shared polymorphic props type for the `as` + `asChild` pattern.
 *
 * Allows components to render as any HTML element or React component
 * while preserving type safety.
 *
 * @template C - The element type to render as (defaults to 'div')
 * @template P - Props owned by the component (take priority over element props)
 *
 * @example
 * ```tsx
 * type MyComponentProps = PolymorphicProps<'div', MyOwnProps>;
 *
 * const MyComponent = <C extends ElementType = 'div'>(
 *   props: MyComponentProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
 * ) => ReactElement;
 * ```
 */
export type PolymorphicProps<C extends ElementType = 'div', P = Record<string, never>> = {
  /** The element or component to render as */
  as?: C;
  /** Render the child element as the root (Radix Slot pattern) */
  asChild?: boolean;
} & Omit<ComponentPropsWithoutRef<C>, keyof P | 'as'> &
  P;

/**
 * Props owned by polymorphic components (not inherited from HTML element).
 * Used with PolymorphicProps to enable type-safe polymorphism.
 */
export interface PolymorphicComponentOwnProps {
  /** Render the child element as the root (Radix Slot pattern) */
  asChild?: boolean;
}

/**
 * Type helper to create a polymorphic component type with proper ref resolution.
 *
 * @template C - The default element type
 * @template P - The component's own props
 *
 * @example
 * ```tsx
 * type MyComponentType = PolymorphicComponentType<'button', MyOwnProps>;
 *
 * const MyComponent: MyComponentType = ...
 * ```
 */
export type PolymorphicComponentType<C extends ElementType = 'div', P = Record<string, never>> = (<
  C2 extends ElementType = C,
>(
  props: PolymorphicProps<C2, P> & {
    ref?: ForwardedRef<ComponentRef<C2>>;
  }
) => ReactElement) & {
  displayName?: string;
};

/**
 * Helper to infer the ref type for a given element type.
 * @internal
 */
type ComponentRef<C extends ElementType> =
  C extends ForwardedRef<infer R>
    ? R
    : C extends React.ComponentType<infer R>
      ? R extends { ref?: infer Ref }
        ? Ref
        : never
      : never;
