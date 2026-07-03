// ============================================
// CardHeader Component
// ============================================

import React from 'react';
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
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  withBorder = false,
  ...props
}) => {
  const headerClasses = [styles.cardHeader, withBorder && styles.withBorder, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

export default CardHeader;
