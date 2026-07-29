import { classNames } from '@/shared/lib/utils/classNames';
import type { CardTitleProps } from '../../model/types';
import styles from './CardTitle.module.scss';

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  as = 'h3',
  ...props
}) => {
  const Tag = as;
  const titleClasses = classNames(styles.cardTitle, className);

  return (
    <Tag className={titleClasses} {...props}>
      {children}
    </Tag>
  );
};

CardTitle.displayName = 'CardTitle';
