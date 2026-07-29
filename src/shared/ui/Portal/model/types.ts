import { ReactNode } from 'react';

/**
 * Props for the Portal component.
 *
 * Renders children into a DOM node outside the parent hierarchy
 * using `createPortal`. Defaults to `document.body`.
 *
 * @example
 * // Render in document.body
 * <Portal><Modal /></Portal>
 *
 * @example
 * // Render in a custom container
 * <Portal element={myDiv}><Tooltip /></Portal>
 */
export interface PortalProps {
  /** Content to teleport into the target container. */
  children: ReactNode;

  /**
   * Target DOM element.
   * @default document.body
   */
  element?: HTMLElement;

  /**
   * When true, renders children inline without createPortal.
   * Useful for testing, SSR, or when the portal target isn't available.
   * @default false
   */
  disablePortal?: boolean;
}
