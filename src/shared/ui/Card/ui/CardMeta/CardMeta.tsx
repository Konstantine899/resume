import { Paragraph } from '@/shared/ui/Paragraph';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardMetaProps } from '../../model/types';
import styles from './CardMeta.module.scss';

export const CardMeta: React.FC<CardMetaProps> = ({ children, className = '', ...props }) => {
  const metaClasses = classNames(styles.cardMeta, className);

  return (
    <div className={metaClasses} {...props}>
      <Paragraph size="xs" theme="tertiary">
        {children}
      </Paragraph>
    </div>
  );
};

CardMeta.displayName = 'CardMeta';
