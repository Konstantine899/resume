import type { KeyboardEvent } from 'react';

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

  /** Click handler — overlay gets `cursor: pointer` only when set. */
  onClick?: () => void;

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
}
