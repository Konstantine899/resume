// src/shared/ui/Skeleton/ui/Skeleton.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useEffect, useMemo } from 'react';
import type { SkeletonProps, SkeletonVariant } from '../model/types';
import styles from './Skeleton.module.scss';

// Valid values for runtime validation
const VALID_VARIANTS: SkeletonVariant[] = ['text', 'circular', 'rectangular'];
const MAX_LINES = 10;
const MIN_LINES = 1;

/**
 * Runtime validation for Skeleton props (development only)
 */
const validateSkeletonProps = (props: SkeletonProps) => {
  if (process.env.NODE_ENV === 'development') {
    const { variant, lines, delay, duration } = props;

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

  // Runtime validation in development mode
  useEffect(() => {
    validateSkeletonProps(props);
  }, [props]);

  const skeletonClassName = classNames(styles.skeleton, styles[variant], className);

  // Memoize lines array for multi-line text variant
  const linesArray = useMemo(() => {
    if (variant !== 'text' || lines <= 1) {
      return null;
    }

    return Array.from({ length: lines }).map((_, index) => ({
      index,
      isLast: index === lines - 1,
      // Round to avoid floating point precision issues (0.1 + 0.2 = 0.30000000000000004)
      delay: Math.round((delay + index * 0.1) * 100) / 100,
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
