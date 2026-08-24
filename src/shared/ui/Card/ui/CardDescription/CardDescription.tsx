import { Paragraph } from '@/shared/ui/Paragraph';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardDescriptionProps } from '../../model/types';
import styles from './CardDescription.module.scss';

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <Paragraph
      as="p"
      size="s"
      theme="muted"
      className={classNames(styles.cardDescription, className)}
      {...props}
    >
      {children}
    </Paragraph>
  );
};

CardDescription.displayName = 'CardDescription';
