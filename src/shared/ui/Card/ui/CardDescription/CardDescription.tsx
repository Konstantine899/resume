import { forwardRef, memo } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardDescriptionProps } from '../../model/types';
import styles from './CardDescription.module.scss';

export const CardDescription = memo(
  forwardRef<HTMLParagraphElement, CardDescriptionProps>(function CardDescription(
    { children, className = '', ...props },
    ref
  ) {
    return (
      <Paragraph
        ref={ref}
        as="p"
        size="s"
        theme="muted"
        className={classNames(styles.cardDescription, className)}
        {...props}
      >
        {children}
      </Paragraph>
    );
  })
);
CardDescription.displayName = 'CardDescription';
