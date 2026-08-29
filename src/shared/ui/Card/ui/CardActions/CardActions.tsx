import { forwardRef, memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Divider } from '@/shared/ui/Divider';
import type { CardActionsProps } from '../../model/types';
import styles from './CardActions.module.scss';

export const CardActions = memo(
  forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
    { children, className = '', align = 'start', ...props },
    ref
  ) {
    const actionsClasses = classNames(
      styles.cardActions,
      styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
      className
    );

    return (
      <div ref={ref} className={actionsClasses} {...props}>
        <Divider className={styles.divider} />
        <div className={styles.actionsInner}>{children}</div>
      </div>
    );
  })
);
CardActions.displayName = 'CardActions';
