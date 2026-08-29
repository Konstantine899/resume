import type { KeyboardEvent, MouseEventHandler } from 'react';

/**
 * Props for the Overlay component.
 *
 * A fixed-position scrim over the viewport with optional blur/dark
 * variants, fade-in/out animation via `visible`, and conditional
 * click behavior.
 *
 * @example
 * // Default overlay with click-to-close
 * <Overlay onClick={handleClose} />
 *
 * @example
 * // Blur overlay with fade animation
 * <Overlay blur visible={isOpen} onClick={handleClose} />
 */
export interface OverlayProps {
  /** Content rendered above the scrim (e.g. modal panel). */
  children?: React.ReactNode;

  /** Click handler — receives the native click event. Overlay gets `cursor: pointer` only when set. */
  onClick?: MouseEventHandler<HTMLDivElement>;

  /** Keyboard handler — forwarded to the overlay div. */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;

  /** Additional CSS class. */
  className?: string;

  /** Apply backdrop-filter: blur(4px). */
  blur?: boolean;

  /** Darker scrim (rgba(0,0,0,0.8) instead of 0.6). */
  dark?: boolean;

  /**
   * Controls visibility with CSS opacity transition.
   * @default true
   */
  visible?: boolean;

  /**
   * Called when the Escape key is pressed. Fires before onKeyDown.
   * @param event The keyboard event
   */
  onEscapeKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;

  /**
   * Custom z-index for the overlay. Overrides the default from OVERLAY_CONSTANTS.
   */
  zIndex?: number;

  /**
   * Unmount the overlay DOM node when visible is false (instead of hiding with opacity 0).
   * All hooks still run before the conditional return to preserve hook order.
   * @default false
   */
  unmountOnExit?: boolean;

  /**
   * Transition duration in seconds for the opacity animation.
   * Passed to CSS via --overlay-duration custom property.
   * @default 0.2
   */
  transitionDuration?: number;

  /** Called when the overlay becomes visible (visible transitions to true). */
  onOpen?: () => void;

  /** Called when the overlay becomes hidden (visible transitions to false). */
  onClose?: () => void;

  /**
   * Prevent body scroll when overlay is visible.
   * Sets document.body.style.overflow = 'hidden' while active.
   * @default false
   */
  preventScroll?: boolean;

  /**
   * Container element for React Portal rendering.
   * If provided, overlay children render via createPortal into this container.
   * If null or undefined, renders normally (no portal).
   */
  container?: HTMLElement | null;

  /**
   * CSS animation preset applied via data-animation attribute.
   * - 'fade': default opacity transition
   * - 'scale': scale-in/out effect
   * - 'slide': slide-in/out from top
   * @default 'fade'
   */
  animation?: 'fade' | 'scale' | 'slide';
}
