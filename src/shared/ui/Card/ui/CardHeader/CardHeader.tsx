// ============================================
// CardHeader Component
// ============================================

import { forwardRef, memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Divider } from '@/shared/ui/Divider';
import type { CardHeaderProps } from '../../model/types';
import styles from './CardHeader.module.scss';

/**
 * Заголовок карточки
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Header withBorder>Заголовок</Card.Header>
 *   <Card.Body>Контент</Card.Body>
 * </Card>
 * ```
 */
export const CardHeader = memo(
  forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
    { children, className = '', withBorder = false, ...props },
    ref
  ) {
    const headerClasses = classNames(styles.cardHeader, withBorder && styles.withBorder, className);

    return (
      <div ref={ref} className={headerClasses} {...props}>
        <div className={styles.content}>{children}</div>
        {withBorder && <Divider className={styles.divider} />}
      </div>
    );
  })
);
CardHeader.displayName = 'CardHeader';
