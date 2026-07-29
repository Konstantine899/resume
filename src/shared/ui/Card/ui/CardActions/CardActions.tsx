import { classNames } from '@/shared/lib/utils/classNames';
import type { CardActionsProps } from '../../model/types';
import styles from './CardActions.module.scss';

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  className = '',
  align = 'start',
  ...props
}) => {
  const actionsClasses = classNames(
    styles.cardActions,
    styles[`align${align.charAt(0).toUpperCase() + align.slice(1)}`],
    className
  );

  return (
    <div className={actionsClasses} {...props}>
      {children}
    </div>
  );
};

CardActions.displayName = 'CardActions';
