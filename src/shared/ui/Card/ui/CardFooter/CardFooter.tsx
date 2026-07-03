// ============================================
// CardFooter Component
// ============================================

import React from 'react';
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
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  withBorder = false,
  ...props
}) => {
  const footerClasses = [styles.cardFooter, withBorder && styles.withBorder, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';

export default CardFooter;
