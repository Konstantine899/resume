// ============================================
// CardBody Component
// ============================================

import React from 'react';
import type { CardBodyProps } from '../../model/types';
import styles from './CardBody.module.scss';

/**
 * Тело карточки (основной контент)
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Header>Заголовок</Card.Header>
 *   <Card.Body>Основной контент</Card.Body>
 * </Card>
 * ```
 */
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '', ...props }) => {
  const bodyClasses = [styles.cardBody, className].filter(Boolean).join(' ');

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

CardBody.displayName = 'CardBody';

export default CardBody;
