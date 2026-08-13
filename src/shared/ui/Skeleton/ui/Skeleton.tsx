// src/shared/ui/Skeleton/ui/Skeleton.tsx

import { memo } from 'react';
import type { ElementType, ForwardedRef, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { SkeletonProps, SkeletonComponent } from '../model/types';
import { useSkeleton } from '../lib/hooks/useSkeleton';
import styles from './Skeleton.module.scss';

/**
 * Skeleton — компонент для отображения состояния загрузки контента.
 *
 * @description
 * Поддерживает полиморфный `as` prop, три варианта (text, circular, rectangular), multi-line,
 * настраиваемые width/height, stagger-delay для строк, shimmer анимацию.
 * Использует CSS-переменные `--skeleton-duration`, `--skeleton-delay`.
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Skeleton ratio="16/9" variant="text" width="200px" height="20px" />
 * <Skeleton ratio="4/3" variant="circular" width="48px" height="48px" />
 * <Skeleton ratio="16/9" variant="text" width="300px" lines={4} />
 * <Skeleton ratio="16/9" as="article" className="custom" />
 * ```
 */

/**
 * Implementation function — generic over `as` prop
 */
function SkeletonImpl<C extends ElementType = 'div'>(
  {
    as,
    ratio,
    variant,
    width,
    height,
    lines,
    delay,
    duration,
    className,
    'aria-label': ariaLabel,
    ...restProps
  }: SkeletonProps<C> & { ref?: ForwardedRef<HTMLElement> },
  ref: ForwardedRef<HTMLElement>
): ReactElement {
  const { t } = useTranslation();

  // Delegate to useSkeleton hook (ariaLabel computed inside hook from t('loading'))
  const {
    skeletonClassName,
    linesArray,
    singleLineStyle,
    lineStyle,
    effectiveAriaLabel,
    dataAttrs,
  } = useSkeleton({
    ratio,
    variant,
    width,
    height,
    lines,
    delay,
    duration,
    className,
    as,
    ariaLabel: ariaLabel ?? t('loading'),
  });
  const Component = (as ?? 'div') as ElementType;

  // For text variant with multiple lines
  if (variant === 'text' && linesArray) {
    return (
      <Component
        ref={ref}
        className={skeletonClassName}
        role="status"
        aria-busy="true"
        aria-label={effectiveAriaLabel}
        {...dataAttrs}
        {...restProps}
      >
        {linesArray.map(({ index, isLast, delay: lineDelay }) => (
          <span
            key={index}
            className={styles.line + (isLast ? ` ${styles.lastLine}` : '')}
            style={lineStyle(lineDelay)}
            data-testid={isLast ? 'skeleton-line-last' : `skeleton-line-${index}`}
          />
        ))}
      </Component>
    );
  }

  // Single skeleton (text, circular, rectangular)
  return (
    <Component
      ref={ref}
      className={skeletonClassName}
      style={singleLineStyle}
      role="status"
      aria-busy="true"
      aria-label={effectiveAriaLabel}
      {...dataAttrs}
      {...restProps}
    />
  );
}

/**
 * Memo-cast pattern (Divider/Paragraph precedent) — preserves React.memo with generic component
 */
const SkeletonMemo = memo(
  SkeletonImpl as unknown as (
    props: SkeletonProps<'div'> & { ref?: ForwardedRef<HTMLDivElement> }
  ) => ReactElement
);
SkeletonMemo.displayName = 'Skeleton';

export const Skeleton = SkeletonMemo as unknown as SkeletonComponent;
