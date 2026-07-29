import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import type { SlotProps } from '../model/types';

/**
 * Slot component — не создаёт свой DOM-узел, а клонирует единственного
 * дочернего ReactElement с merged className, id, data-testid и ref.
 *
 * @example
 * ```tsx
 * <Slot className="wrapper-class" data-testid="slot">
 *   <span>Оригинальный элемент</span>
 * </Slot>
 * // → <span class="original-class wrapper-class" data-testid="slot">Оригинальный элемент</span>
 * ```
 */
export const Slot = forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const { children, className, id, 'data-testid': dataTestId } = props;

  const child = Children.only(children);

  if (!isValidElement(child)) {
    return null;
  }

  const childProps = child.props as Record<string, unknown>;
  const mergedProps: Record<string, unknown> = {};

  // Merged className: child's original + parent's (parent wins on conflicts via order)
  if (className) {
    const existingClassName = childProps.className;
    mergedProps.className = existingClassName
      ? `${className} ${String(existingClassName)}`
      : className;
  }

  // id and data-testid override child's values
  if (id) {
    mergedProps.id = id;
  }

  if (dataTestId) {
    mergedProps['data-testid'] = dataTestId;
  }

  // Forward ref to child
  if (ref) {
    mergedProps.ref = ref;
  }

  return cloneElement(child, mergedProps);
});

Slot.displayName = 'Slot';
