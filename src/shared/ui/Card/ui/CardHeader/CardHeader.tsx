// ============================================
// CardHeader Component
// ============================================

import React from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
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
  const headerClasses = classNames(styles.cardHeader, withBorder && styles.withBorder, className);

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';
