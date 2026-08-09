// src/shared/ui/AspectRatio/model/types.ts

import type {
  ComponentPropsWithRef,
  ComponentRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react';

/**
 * Ratio expressed as a "width/height" string, e.g. "16/9" or "4/3".
 * The template literal type admits numbers covered by `${number}`
 * (including floats/exponents); the runtime regex validator (AR-07)
 * is the final gate, falling back to DEFAULT_RATIO on mismatch.
 */
export type AspectRatioString = `${number}/${number}`;

/**
 * Props, owned by AspectRatio (not inherited from the HTML element).
 */
export interface AspectRatioOwnProps {
  /** Required ratio like "16/9" (runtime fallback DEFAULT_RATIO + dev-warn) */
  ratio: AspectRatioString;
  /** Custom class merged into the ratio box (consumer last-wins) */
  className?: string;
  /** Content rendered inside the absolute-fill layer */
  children?: ReactNode;
}

/**
 * Base props of AspectRatio + the polymorphic `as` prop.
 *
 * `as` is bound to the generic `C`, so TypeScript infers the element type
 * from the passed value and narrows element-specific props (e.g. `href`
 * when `as="a"`) and the ref type — Divider/Paragraph pattern.
 *
 * @template C - Element type (defaults to 'div')
 */
export type AspectRatioBaseProps<C extends ElementType = 'div'> = { as?: C } & AspectRatioOwnProps;

/**
 * Generic polymorphic props for AspectRatio.
 *
 * @template C - Element type (defaults to 'div')
 */
export type AspectRatioProps<C extends ElementType = 'div'> = AspectRatioBaseProps<C> &
  Omit<ComponentPropsWithRef<C>, keyof AspectRatioOwnProps | 'as' | 'ref'>;

/**
 * Public component type with ref resolution depending on `as`.
 * `displayName` is present on the runtime object (memo wrapper).
 */
export type AspectRatioComponent = (<C extends ElementType = 'div'>(
  props: AspectRatioProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  displayName?: string;
};
