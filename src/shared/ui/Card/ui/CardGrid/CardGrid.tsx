import { classNames } from '@/shared/lib/utils/classNames';
import type { CardGridProps } from '../../model/types';
import styles from './CardGrid.module.scss';

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  className = '',
  columns = 3,
  gap = 'md',
  ...props
}) => {
  const gridClasses = classNames(
    styles.cardGrid,
    styles[`cols${columns}`],
    styles[`gap${gap.charAt(0).toUpperCase() + gap.slice(1)}`],
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

CardGrid.displayName = 'CardGrid';
