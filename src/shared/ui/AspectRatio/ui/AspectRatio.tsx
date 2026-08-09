// src/shared/ui/AspectRatio/ui/AspectRatio.tsx

import { memo } from 'react';
import type { ComponentRef, ElementType, ForwardedRef, ReactElement, Ref } from 'react';
import { useAspectRatio } from '../lib/hooks/useAspectRatio';
import type { AspectRatioComponent, AspectRatioProps } from '../model/types';
import styles from './AspectRatio.module.scss';

/**
 * AspectRatio — locks content into a fixed ratio via inline `aspect-ratio`.
 *
 * @remarks
 * - Renders as `<div>` by default; `as` overrides the root element.
 * - The ratio box gets `data-aspect-ratio` (raw) and, for string `as`,
 *   `data-as` attributes for styling and testing.
 * - Children live inside an absolute fill layer (`.content`) so they
 *   always match the box geometry.
 * - Consumer `style` wins over the computed ratio on conflict.
 */

function AspectRatioImpl<C extends ElementType = 'div'>(
  props: AspectRatioProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
): ReactElement {
  const {
    // React 19 passes the ref as a regular prop (ref-as-prop); the
    // forwardRef second argument is not filled for plain functions.
    ref: forwardedRef,
    as,
    ratio,
    className,
    style: userStyle,
    children,
    ...restProps
  } = props;

  const { ratioStyle, boxClassName, dataAttrs } = useAspectRatio({
    ratio,
    className,
    as,
  });

  // Consumer style wins on conflict (useDivider precedent).
  const mergedStyle = { ...ratioStyle, ...userStyle };

  const Component = (as || 'div') as ElementType;

  return (
    <Component
      ref={forwardedRef as Ref<ComponentRef<C>>}
      className={boxClassName}
      style={mergedStyle}
      {...dataAttrs}
      {...restProps}
    >
      <span className={styles.content}>{children}</span>
    </Component>
  );
}

/**
 * React.memo cannot hold a generic signature, so we cast the generic impl
 * to a concrete 'div'-typed props for memo's internal typing, then re-cast
 * the memoized result to the public generic component below (Divider
 * precedent). Each cast restores the part React.memo discards; neither is
 * a runtime operation.
 */
const AspectRatioMemo = memo(
  AspectRatioImpl as unknown as (
    props: AspectRatioProps<'div'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

AspectRatioMemo.displayName = 'AspectRatio';

// Public API: a genuine generic component. Consumers see `C` inferred from
// `as`, with element-specific props and per-element ref typing.
export const AspectRatio = AspectRatioMemo as unknown as AspectRatioComponent;
