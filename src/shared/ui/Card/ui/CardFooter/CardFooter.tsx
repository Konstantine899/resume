// ============================================
// CardFooter Component
// ============================================

import { forwardRef, memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Divider } from '@/shared/ui/Divider';
import type { CardFooterProps } from '../../model/types';
import styles from './CardFooter.module.scss';

/**
 * Подвал карточки
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Body>Контент</Card.Body>
 *   <Card.Footer withBorder>
 *     <Button>Действие</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
export const CardFooter = memo(
  forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
    { children, className = '', withBorder = false, ...props },
    ref
  ) {
    const footerClasses = classNames(styles.cardFooter, withBorder && styles.withBorder, className);

    return (
      <div ref={ref} className={footerClasses} {...props}>
        {withBorder && <Divider className={styles.divider} />}
        <div className={styles.content}>{children}</div>
      </div>
    );
  })
);
CardFooter.displayName = 'CardFooter';
