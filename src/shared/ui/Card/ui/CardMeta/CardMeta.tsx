import { forwardRef, memo } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardMetaProps } from '../../model/types';
import styles from './CardMeta.module.scss';

export const CardMeta = memo(
  forwardRef<HTMLDivElement, CardMetaProps>(function CardMeta(
    { children, className = '', ...props },
    ref
  ) {
    const metaClasses = classNames(styles.cardMeta, className);

    return (
      <div ref={ref} className={metaClasses} {...props}>
        <Paragraph size="xs" theme="tertiary">
          {children}
        </Paragraph>
      </div>
    );
  })
);
CardMeta.displayName = 'CardMeta';
