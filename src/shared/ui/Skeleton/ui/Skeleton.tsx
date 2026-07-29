// src/shared/ui/Skeleton/ui/Skeleton.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SkeletonProps } from '../model/types';
import { SKELETON_CONSTANTS } from '../model/constants';
import { validateSkeletonProps } from '../lib/utils/validateSkeletonProps';
import styles from './Skeleton.module.scss';

/**
 * Skeleton — компонент для отображения состояния загрузки контента.
 *
 * @description
 * Поддерживает три варианта (text, circular, rectangular), multi-line,
 * настраиваемые width/height, stagger-delay для строк, shimmer анимацию.
 * Использует CSS-переменные `--skeleton-duration`, `--skeleton-delay`.
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" height="20px" />
 * <Skeleton variant="circular" width="48px" height="48px" />
 * <Skeleton variant="text" width="300px" lines={4} />
 * ```
 */
export const Skeleton = memo(
  forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
    const { t } = useTranslation();
    const {
      variant = SKELETON_CONSTANTS.defaults.variant,
      width,
      height,
      lines = SKELETON_CONSTANTS.defaults.lines,
      delay = SKELETON_CONSTANTS.defaults.delay,
      duration = SKELETON_CONSTANTS.defaults.duration,
      className = '',
      'aria-label': ariaLabel,
      ...restProps
    } = props;

    const effectiveAriaLabel = ariaLabel ?? t('loading');

    // Runtime validation in development mode
    if (process.env.NODE_ENV === 'development') {
      validateSkeletonProps(props);
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
        <div
          ref={ref}
          className={skeletonClassName}
          role="status"
          aria-label={effectiveAriaLabel}
          data-variant={variant}
          data-lines={lines}
          {...restProps}
        >
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
        ref={ref}
        className={skeletonClassName}
        style={singleLineStyle}
        role="status"
        aria-label={effectiveAriaLabel}
        data-variant={variant}
        data-lines={lines > 1 ? lines : undefined}
        {...restProps}
      />
    );
  })
);

Skeleton.displayName = 'Skeleton';
