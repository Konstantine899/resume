import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { validatePortalProps } from '../lib/utils/validatePortalProps';
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
 * ```
 */
export const Portal = memo((props: PortalProps) => {
  const { children, element } = props;

  const container = element ?? document.body;

  // Dev warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validatePortalProps(element);
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [element]);

  return createPortal(children, container);
});

Portal.displayName = 'Portal';
