import { forwardRef, memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardGridProps } from '../../model/types';
import styles from './CardGrid.module.scss';

export const CardGrid = memo(
  forwardRef<HTMLDivElement, CardGridProps>(function CardGrid(
    { children, className = '', columns = 3, gap = 'md', ...props },
    ref
  ) {
    const gridClasses = classNames(
      styles.cardGrid,
      styles[`cols${columns}`],
      styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`],
      className
    );

    return (
      <div ref={ref} className={gridClasses} {...props}>
        {children}
      </div>
    );
  })
);
CardGrid.displayName = 'CardGrid';
