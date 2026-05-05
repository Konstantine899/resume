// src/shared/ui/Skeleton/ui/Skeleton.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import type { SkeletonProps } from '../model/types';
import styles from './Skeleton.module.scss';

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

  const skeletonClassName = classNames(styles.skeleton, styles[variant], className);

  // Для текстового варианта с несколькими строками
  if (variant === 'text' && lines > 1) {
    return (
      <div className={skeletonClassName} {...restProps}>
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={classNames(styles.line, index === lines - 1 && styles.lastLine)}
            style={{
              animationDelay: `${delay + index * 0.1}s`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // Одиночный скелетон (text, circular, rectangular)
  const skeletonStyle: React.CSSProperties = {
    width,
    height,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  return (
    <div
      className={skeletonClassName}
      style={skeletonStyle}
      role="status"
      aria-label="Загрузка..."
      {...restProps}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
