import { classNames } from '@/shared/lib/utils/classNames';
import type { CardDescriptionProps } from '../../model/types';
import styles from './CardDescription.module.scss';

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
  ...props
}) => {
  const descClasses = classNames(styles.cardDescription, className);

  return (
    <p className={descClasses} {...props}>
      {children}
    </p>
  );
};

CardDescription.displayName = 'CardDescription';
