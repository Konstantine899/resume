import { classNames } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import type { LoaderProps } from '../model/types';
import styles from './Loader.module.scss';

// Accessibility props для screen readers
const accessibilityProps = {
  role: 'status' as const,
  'aria-busy': 'true' as const,
};

export const Loader = memo((props: LoaderProps) => {
  const {
    variant = 'spinner',
    size = 'md',
    color = 'primary',
    label = 'Loading',
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
          <div className={styles.spinner} {...accessibilityProps} aria-label={label}>
            <div className={styles.spinnerCircle} />
          </div>
        );

      case 'dots':
        return (
          <div className={styles.dots} {...accessibilityProps} aria-label={label}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        );

      case 'pulse':
        return (
          <div className={styles.pulse} {...accessibilityProps} aria-label={label}>
            <div className={styles.pulseCircle} />
          </div>
        );

      case 'double-ring':
        return (
          <div className={styles.doubleRing} {...accessibilityProps} aria-label={label}>
            <div className={styles.outerRing} />
            <div className={styles.innerRing} />
          </div>
        );

      default:
        throw new Error(
          `Unknown variant: ${variant}. Valid variants: spinner, dots, pulse, double-ring`
        );
    }
  };

  return (
    <div className={loaderClassName} {...restProps}>
      {renderLoader()}
    </div>
  );
});

Loader.displayName = 'Loader';
