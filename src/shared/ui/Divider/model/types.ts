// src/shared/ui/Divider/model/types.ts

import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

/**
 * Orientation of the divider line.
 * @horizontal - horizontal line (default)
 * @vertical - vertical line
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Style of the divider line.
 * @solid - solid line
 * @dashed - dashed line
 * @dotted - dotted line
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Polymorphic element accepted by Divider. Restricted to type-safe
 * HTML elements and custom React components.
 */
export type DividerAsElement = ElementType;

/**
 * Props owned by Divider (not inherited from any HTML element).
 */
export interface DividerOwnProps {
  /** Polymorphic root element (defaults to 'div') */
  as?: DividerAsElement;
  /** Divider orientation */
  orientation?: DividerOrientation;
  /** Line style */
  variant?: DividerVariant;
  /** Line thickness (in pixels) */
  thickness?: number;
  /** Custom class */
  className?: string;
  /** Text label for the text divider (horizontal only) */
  children?: ReactNode;
}

/**
 * Generic polymorphic props for Divider.
 * Allows overriding the root element through the `as` prop.
 *
 * @template C - Element type (defaults to 'div')
 */
export type DividerProps<C extends ElementType = 'div'> = DividerOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof DividerOwnProps | 'as'>;

/**
 * Component type with generic ref support.
 */
export type DividerComponent = (<C extends ElementType = 'div'>(
  props: DividerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
};
