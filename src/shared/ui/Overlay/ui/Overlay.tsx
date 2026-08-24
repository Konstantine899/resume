import { forwardRef, memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { classNames } from '@/shared/lib/utils/classNames';
import { validateOverlayProps } from '../lib/utils/validateOverlayProps';
import { OVERLAY_CONSTANTS } from '../model/constants';
import type { OverlayProps } from '../model/types';
import styles from './Overlay.module.scss';

let activeScrollLocks = 0;
let savedBodyOverflow = '';

/**
 * Overlay — fixed-position scrim over the viewport with optional blur/dark
 * variants, fade-in/out animation via `visible`, and conditional click behavior.
 *
 * @example
 * ```tsx
 * // Default overlay with click-to-close
 * <Overlay onClick={handleClose} />
 *
 * // Blur overlay with fade animation
 * <Overlay blur visible={isOpen} onClick={handleClose} />
 * ```
 */
export const Overlay = memo(
  forwardRef<HTMLDivElement, OverlayProps>((props, ref) => {
    const {
      children,
      onClick,
      onKeyDown,
      className = '',
      blur = false,
      dark = false,
      visible = true,
      onEscapeKeyDown,
      zIndex = OVERLAY_CONSTANTS.DEFAULT_Z_INDEX,
      unmountOnExit = false,
      transitionDuration = OVERLAY_CONSTANTS.DEFAULT_TRANSITION_DURATION,
      onOpen,
      onClose,
      preventScroll = false,
      container,
      animation = OVERLAY_CONSTANTS.DEFAULT_ANIMATION,
    } = props;

    const prevVisibleRef = useRef(visible);

    // Dev warnings
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const warnings = validateOverlayProps(blur, dark);
        warnings.forEach((w) => {
          // eslint-disable-next-line no-console
          console.warn(w.message);
        });
      }
    }, [blur, dark]);

    // OVR-05: Animation callbacks
    useEffect(() => {
      if (prevVisibleRef.current !== visible) {
        if (visible && onOpen) {
          onOpen();
        } else if (!visible && onClose) {
          onClose();
        }
        prevVisibleRef.current = visible;
      }
    }, [visible, onOpen, onClose]);

    // OVR-08: Body scroll lock
    useEffect(() => {
      if (preventScroll && visible) {
        if (activeScrollLocks === 0) {
          savedBodyOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        }
        activeScrollLocks += 1;
        return () => {
          activeScrollLocks -= 1;
          if (activeScrollLocks === 0) {
            document.body.style.overflow = savedBodyOverflow;
          }
        };
      }
      return undefined;
    }, [preventScroll, visible]);

    // OVR-03: Unmount on exit — all hooks above must run before this conditional return
    if (unmountOnExit && !visible) {
      return null;
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && onEscapeKeyDown) {
        onEscapeKeyDown(e);
      }
      onKeyDown?.(e);
    };

    const overlayClassName = classNames(
      styles.overlay,
      blur && styles.blur,
      dark && styles.dark,
      onClick && styles.clickable,
      className
    );

    const style: React.CSSProperties = {
      zIndex,
      '--overlay-duration': `${transitionDuration}s`,
    } as React.CSSProperties;

    const overlayElement = (
      <div
        ref={ref}
        className={overlayClassName}
        data-visible={visible}
        data-blur={blur || undefined}
        data-dark={dark || undefined}
        data-animation={animation}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        style={style}
        role="presentation"
        data-testid="overlay"
        aria-hidden={children ? undefined : 'true'}
      >
        {children}
      </div>
    );

    // OVR-09: Portal rendering
    if (container) {
      return createPortal(overlayElement, container);
    }

    return overlayElement;
  })
);

Overlay.displayName = 'Overlay';
