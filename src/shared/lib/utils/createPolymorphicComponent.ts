import { memo, forwardRef } from 'react';
import type { ElementType, ForwardedRef, ComponentRef, ReactElement } from 'react';
import type { PolymorphicProps } from '@/shared/lib/types/polymorphic';

/**
 * Creates a polymorphic component with proper typing and minimal casting.
 * Eliminates the triple-cast pattern used in components like Button, Input, etc.
 */
export function createPolymorphicComponent<
  C extends ElementType = 'div',
  P = Record<string, never>,
>(
  ComponentImpl: <C2 extends ElementType = C>(
    props: PolymorphicProps<C2, P> & { ref?: ForwardedRef<ComponentRef<C2>> }
  ) => ReactElement,
  displayName: string
): <C2 extends ElementType = C>(
  props: PolymorphicProps<C2, P> & { ref?: ForwardedRef<ComponentRef<C2>> }
) => ReactElement {
  // Wrap with forwardRef to properly handle ref forwarding
  const ForwardedComponent = forwardRef<ComponentRef<ElementType>, Record<string, unknown>>(
    (props, ref) =>
      ComponentImpl({ ...props, ref } as PolymorphicProps<ElementType, P> & {
        ref?: ForwardedRef<ComponentRef<ElementType>>;
      })
  );

  ForwardedComponent.displayName = displayName;

  // Wrap with memo for performance
  const MemoizedComponent = memo(ForwardedComponent);

  // Set displayName on the memoized component
  MemoizedComponent.displayName = displayName;

  // Cast to the final polymorphic type
  return MemoizedComponent as <C2 extends ElementType = C>(
    props: PolymorphicProps<C2, P> & { ref?: ForwardedRef<ComponentRef<C2>> }
  ) => ReactElement;
}
