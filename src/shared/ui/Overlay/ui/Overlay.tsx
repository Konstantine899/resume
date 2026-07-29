import { forwardRef, memo, useEffect } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { validateOverlayProps } from '../lib/utils/validateOverlayProps';
import type { OverlayProps } from '../model/types';
import styles from './Overlay.module.scss';

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
    } = props;

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

    const overlayClassName = classNames(
      styles.overlay,
      blur && styles.blur,
      dark && styles.dark,
      className
    );

    return (
      <div
        ref={ref}
        className={overlayClassName}
        data-visible={visible}
        data-blur={blur || undefined}
        data-dark={dark || undefined}
        onClick={onClick}
        onKeyDown={onKeyDown}
        style={{ cursor: onClick ? 'pointer' : undefined }}
        role="presentation"
        data-testid="overlay"
        aria-hidden="true"
      >
        {children}
      </div>
    );
  })
);

Overlay.displayName = 'Overlay';
