import { classNames } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import type { LoaderProps } from '../model/types';
import styles from './Loader.module.scss';

export const Loader = memo((props: LoaderProps) => {
  const {
    variant = 'spinner',
    size = 'md',
    color = 'primary',
    label = 'Загрузка...',
    className = '',
    ...restProps
  } = props;

  const loaderClassName = classNames(
    styles.loader,
    styles[variant],
    styles[size],
    styles[color],
    className
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={styles.spinner} role="status" aria-label={label} aria-busy="true">
            <div className={styles.spinnerCircle} />
          </div>
        );

      case 'dots':
        return (
          <div className={styles.dots} role="status" aria-label={label} aria-busy="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        );

      case 'pulse':
        return (
          <div className={styles.pulse} role="status" aria-label={label} aria-busy="true">
            <div className={styles.pulseCircle} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={loaderClassName} {...restProps}>
      {renderLoader()}
    </div>
  );
});

Loader.displayName = 'Loader';
