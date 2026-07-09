// src/shared/ui/Skeleton/ui/Skeleton.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useMemo } from 'react';
import type { SkeletonProps } from '../model/types';
import { SKELETON_CONSTANTS } from '../model/constants';
import styles from './Skeleton.module.scss';

/**
 * Runtime validation for Skeleton props (development only)
 */
const validateSkeletonProps = (
  variant: SkeletonProps['variant'],
  lines: SkeletonProps['lines'],
  delay: SkeletonProps['delay'],
  duration: SkeletonProps['duration']
) => {
  if (process.env.NODE_ENV === 'development') {
    const { VALID_VARIANTS, MIN_LINES, MAX_LINES } = SKELETON_CONSTANTS;

    if (variant && !VALID_VARIANTS.includes(variant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Skeleton: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
      );
    }

    if (lines !== undefined && (lines < MIN_LINES || lines > MAX_LINES)) {
      // eslint-disable-next-line no-console
      console.warn(`Skeleton: invalid lines "${lines}". Valid range: ${MIN_LINES}-${MAX_LINES}`);
    }

    if (delay !== undefined && delay < 0) {
      // eslint-disable-next-line no-console
      console.warn(`Skeleton: invalid delay "${delay}". Must be >= 0`);
    }

    if (duration !== undefined && duration <= 0) {
      // eslint-disable-next-line no-console
      console.warn(`Skeleton: invalid duration "${duration}". Must be > 0`);
    }
  }
};

export const Skeleton = memo((props: SkeletonProps) => {
  const {
    variant = 'text',
    width,
    height,
    lines = 1,
    delay = 0,
    duration = 1.5,
    className = '',
    ...restProps
  } = props;

  // Runtime validation in development mode (only for props that can be invalid)
  if (process.env.NODE_ENV === 'development') {
    validateSkeletonProps(variant, lines, delay, duration);
  }

  const skeletonClassName = classNames(styles.skeleton, styles[variant], className);

  // Memoize lines array for multi-line text variant
  const linesArray = useMemo(() => {
    if (variant !== 'text' || lines <= 1) {
      return null;
    }

    return Array.from({ length: lines }).map((_, index) => ({
      index,
      isLast: index === lines - 1,
      // Round to 3 decimal places to avoid floating point precision issues
      delay: Math.round((delay + index * 0.1) * 1000) / 1000,
    }));
  }, [variant, lines, delay]);

  // Memoize style for single-line variant
  const singleLineStyle = useMemo(() => {
    return {
      width,
      height,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  }, [width, height, delay, duration]);

  // Для текстового варианта с несколькими строками
  if (variant === 'text' && lines > 1 && linesArray) {
    return (
      <div className={skeletonClassName} role="status" aria-label="Загрузка..." {...restProps}>
        {linesArray.map(({ index, isLast, delay: lineDelay }) => (
          <span
            key={index}
            className={classNames(styles.line, isLast && styles.lastLine)}
            style={{
              animationDelay: `${lineDelay}s`,
              animationDuration: `${duration}s`,
            }}
            data-testid={isLast ? 'skeleton-line-last' : `skeleton-line-${index}`}
          />
        ))}
      </div>
    );
  }

  // Одиночный скелетон (text, circular, rectangular)
  return (
    <div
      className={skeletonClassName}
      style={singleLineStyle}
      role="status"
      aria-label="Загрузка..."
      {...restProps}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
