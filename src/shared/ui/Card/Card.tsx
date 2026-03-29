// ============================================
// Card Component
// ============================================

import React from 'react';
import styles from './Card.module.scss';
import type { CardProps } from './types';

/**
 * Card Component
 * 
 * A flexible card component with multiple variants and states.
 * Follows FSD architecture - reusable UI component.
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  hoverable = false,
  clickable = false,
  children,
  ...props
}) => {
  // Build CSS classes
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[size],
    hoverable && styles.hoverable,
    clickable && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;