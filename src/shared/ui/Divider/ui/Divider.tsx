// src/shared/ui/Divider/ui/Divider.tsx

import { memo, forwardRef } from 'react';
import type { ElementType, ForwardedRef, ReactElement } from 'react';
import { useDivider } from '../lib/hooks/useDivider';
import type { DividerComponent, DividerProps } from '../model/types';
import styles from './Divider.module.scss';

/**
 * Divider — polymorphic visual separator.
 *
 * @remarks
 * - Renders as `<div>` with `role="separator"` by default.
 * - `as` overrides the root element (e.g. `as="hr"` for semantics).
 * - `children` enables the text-divider layout (label between lines),
 *   only supported for `orientation="horizontal"`.
 * - `thickness` drives the line thickness (1-10px). For the horizontal line
 *   the thickness is drawn via `border-top-width` (thickness fix).
 */

const dividerRef = forwardRef(function DividerImpl<C extends ElementType = 'div'>(
  {
    as,
    orientation = 'horizontal',
    variant = 'solid',
    thickness = 1,
    className = '',
    children,
    style: userStyle,
    ...restProps
  }: DividerProps<C>,
  ref: ForwardedRef<HTMLElement>
): ReactElement {
  const hasChildren = children != null && children !== '';
  // Children are only valid for horizontal orientation: warn and fall
  // back to a pure line when combined with vertical orientation.
  const textDivider = hasChildren && orientation === 'horizontal';
  const pureLineChildren = hasChildren && orientation === 'vertical';

  if (pureLineChildren && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn(
      'Divider: children are only supported with orientation="horizontal". Children ignored.'
    );
  }

  const { dividerClassName, dataAttrs, style } = useDivider({
    orientation,
    variant,
    thickness,
    className,
    hasChildren: textDivider,
  });

  const mergedStyle = { ...style, ...userStyle };

  const Component = (as || 'div') as ElementType;

  return (
    <Component
      ref={ref}
      className={dividerClassName}
      role="separator"
      aria-orientation={orientation}
      {...dataAttrs}
      {...restProps}
      style={mergedStyle}
    >
      {textDivider ? <span className={styles.text}>{children}</span> : null}
    </Component>
  );
});

const DividerMemo = memo(
  // `memo` cannot hold a generic signature, so we cast the generic impl to a
  // concrete 'div'-typed props for memo's internal typing, then re-cast the
  // memoized result to the public generic component below. Each cast restores
  // the part `React.memo` discards; neither is a runtime operation.
  dividerRef as unknown as (
    props: DividerProps<'div'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

DividerMemo.displayName = 'Divider';

// Public API: a genuine generic component. Consumers see `C` inferred from
// `as`, with element-specific props and per-element ref typing. The two casts
// above intentionally disable cross-checking between impl and this signature.
export const Divider = DividerMemo as unknown as DividerComponent;
