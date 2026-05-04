import { classNames } from '@/shared/lib/utils/classNames';
import type { OverlayProps } from '../model/types';
import styles from './Overlay.module.scss';

export const Overlay = ({
  children,
  onClick,
  className = '',
  blur = false,
  dark = false,
}: OverlayProps) => {
  const overlayClassName = classNames(
    styles.overlay,
    blur && styles.blur,
    dark && styles.dark,
    className
  );

  return (
    <div className={overlayClassName} onClick={onClick} role="presentation" data-testid="overlay">
      {children}
    </div>
  );
};
