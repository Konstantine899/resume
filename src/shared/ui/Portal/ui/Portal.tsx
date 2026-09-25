import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PortalProps } from '../model/types';

/**
 * In the browser we teleport before paint (no flash of inline content);
 * under SSR `document` is absent and the effect never runs anyway.
 */
const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Portal — teleports children into a DOM node outside the parent hierarchy
 * using `createPortal`. Defaults to `document.body`.
 *
 * SSR-safe: children render inline on the first (server/pre-mount) render and
 * are teleported only after mount, so `document` is never dereferenced during
 * render.
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

  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (disablePortal || !mounted) {
    return <>{children}</>;
  }

  // A provided container is only used while it is still attached to the
  // document; otherwise fall back to the default (mounted + document.body).
  const container = element?.isConnected ? element : document.body;
  return createPortal(children, container);
});

Portal.displayName = 'Portal';
