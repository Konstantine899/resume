import { useMemo, useEffect } from 'react';
import type {
  ElementType,
  MouseEventHandler,
  KeyboardEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { CARD_CONSTANTS } from './constants';
import { classNames } from '@/shared/lib/utils/classNames';
import { validateCardProps } from '../lib/utils/validateCardProps';
import type { CardOwnProps } from './types';
import styles from '../ui/Card.module.scss';

export interface UseCardConfig extends CardOwnProps {
  onClick?: MouseEventHandler;
  /** Resolved polymorphic element (D1: `component`, never `as`). */
  component?: ElementType;
  /** Present when the polymorphic element is an anchor/Link with an href. */
  href?: string;
  /** True when `component` is the `Link` component (anchor-like). */
  isLink?: boolean;
}

export interface UseCardInteractivity {
  /** `button` when acting as a clickable control; `group` for a plain default-div card; otherwise undefined. */
  role: 'button' | 'group' | undefined;
  tabIndex: 0 | undefined;
  onKeyDown: KeyboardEventHandler | undefined;
  interactive: boolean;
}

export interface UseCardReturn {
  cardClasses: string;
  safeVariant: CardOwnProps['variant'];
  safeSize: CardOwnProps['size'];
  safeRadius: CardOwnProps['radius'];
  interactivity: UseCardInteractivity;
}

/**
 * Derive interactive-card a11y (CARD-P0-4).
 *
 * - A card acts as a button when it has `onClick`, or is a native `<button>`,
 *   or is an anchor/Link used WITHOUT an href (button-semantics anchor).
 * - A real link (`<a href>` / `Link href`) is NOT a button — it keeps link semantics.
 * - `onKeyDown` (Enter/Space → onClick) is attached ONLY for non-native controls,
 *   so native `<a>`/`<button>` never double-fire.
 */
function deriveInteractivity(
  onClick: MouseEventHandler | undefined,
  component: ElementType | undefined,
  href: string | undefined,
  isLink: boolean | undefined
): UseCardInteractivity {
  const isAnchorLike = component === 'a' || isLink === true;
  const isRealLink = isAnchorLike && Boolean(href);
  const isNativeHandled = component === 'button' || isRealLink;

  const actsAsButton = component === 'button' || (Boolean(onClick) && !isRealLink);
  const interactive = actsAsButton;

  const role: UseCardInteractivity['role'] = actsAsButton
    ? 'button'
    : component == null || component === 'div'
      ? 'group'
      : undefined;

  const keyboardInteractive = actsAsButton && !isNativeHandled;
  const tabIndex: 0 | undefined = keyboardInteractive ? 0 : undefined;

  const onKeyDown: KeyboardEventHandler | undefined = keyboardInteractive
    ? (e: ReactKeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          onClick?.(e as unknown as ReactMouseEvent);
        }
      }
    : undefined;

  return { role, tabIndex, onKeyDown, interactive };
}

export function useCard({
  variant = CARD_CONSTANTS.DEFAULT_VARIANT,
  size = CARD_CONSTANTS.DEFAULT_SIZE,
  radius = CARD_CONSTANTS.DEFAULT_RADIUS,
  fullWidth = false,
  hoverable = true,
  className = '',
  onClick,
  component,
  href,
  isLink,
}: UseCardConfig): UseCardReturn {
  const safeVariant = variant ?? CARD_CONSTANTS.DEFAULT_VARIANT;
  const safeSize = size ?? CARD_CONSTANTS.DEFAULT_SIZE;
  const safeRadius = radius ?? CARD_CONSTANTS.DEFAULT_RADIUS;

  const interactivity = deriveInteractivity(onClick, component, href, isLink);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateCardProps(safeVariant, safeSize, safeRadius, hoverable, onClick);
      warnings.forEach((w: { message: string }) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
    // CARD-P0-4: dev-only warning when an anchor/Link renders without href.
    if (process.env.NODE_ENV !== 'production') {
      const isAnchorLike = component === 'a' || isLink === true;
      if (isAnchorLike && !href) {
        // eslint-disable-next-line no-console
        console.warn(
          '[Card] `component="a"` (or Link) is used without an `href`. ' +
            'An anchor without href is not keyboard-activatable and provides no destination.'
        );
      }
    }
  }, [safeVariant, safeSize, safeRadius, hoverable, onClick, component, href, isLink]);

  const cardClasses = useMemo(
    () =>
      classNames(
        styles.card,
        styles[safeVariant ?? CARD_CONSTANTS.DEFAULT_VARIANT],
        styles[safeSize ?? CARD_CONSTANTS.DEFAULT_SIZE],
        styles[safeRadius ?? CARD_CONSTANTS.DEFAULT_RADIUS],
        fullWidth && styles.fullWidth,
        !hoverable && styles.noHover,
        className
      ),
    [safeVariant, safeSize, safeRadius, fullWidth, hoverable, className]
  );

  return { cardClasses, safeVariant, safeSize, safeRadius, interactivity };
}
