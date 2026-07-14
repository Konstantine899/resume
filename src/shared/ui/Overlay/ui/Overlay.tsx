import { memo, useEffect } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { OverlayProps } from '../model/types';
import styles from './Overlay.module.scss';

export const Overlay = memo((props: OverlayProps) => {
  const {
    children,
    onClick,
    onKeyDown,
    className = '',
    blur = false,
    dark = false,
    visible = true,
  } = props;

  // Dev warning: blur+dark combo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && blur && dark) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Overlay] Using both blur and dark simultaneously may produce unexpected visual results.'
      );
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
      className={overlayClassName}
      data-visible={visible}
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
});

Overlay.displayName = 'Overlay';
