import { memo } from 'react';
import { createPortal } from 'react-dom';
import type { PortalProps } from '../model/types';

/**
 * Portal — teleports children into a DOM node outside the parent hierarchy
 * using `createPortal`. Defaults to `document.body`.
 *
 * @example
 * ```tsx
 * // Render in document.body
 * <Portal><Modal /></Portal>
 *
 * // Render in a custom container
 * <Portal element={myDiv}><Tooltip /></Portal>
 *
 * // Disable portal (inline render)
 * <Portal disablePortal><Modal /></Portal>
 * ```
 */
export const Portal = memo((props: PortalProps) => {
  const { children, element, disablePortal = false } = props;

  if (disablePortal) {
    return <>{children}</>;
  }

  const container = element ?? document.body;
  return createPortal(children, container);
});

Portal.displayName = 'Portal';
