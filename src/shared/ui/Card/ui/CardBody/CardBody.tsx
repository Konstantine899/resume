// ============================================
// CardBody Component
// ============================================

import React from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
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
  const bodyClasses = classNames(styles.cardBody, className);

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

CardBody.displayName = 'CardBody';
