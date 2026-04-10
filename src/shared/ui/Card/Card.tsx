// ============================================
// Card Component
// ============================================

import React from 'react';
import styles from './Card.module.scss';
import type { CardProps } from './types';

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'default',
  radius = '',
  fullWidth = false,
  hoverable = true,
  backgroundImage,
  className = '',
  children,
  ...props
}) => {
  // Build CSS classes
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[size],
    styles[radius],
    fullWidth && styles.fullWidth,
    !hoverable && styles.noHover,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {/* Background image overlay (for project cards) */}
      {backgroundImage && (
        <div
          className={styles.backgroundImage}
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      {/* Gradient overlay (for project cards) */}
      {variant === 'project' && <div className={styles.gradientOverlay} />}

      {/* Content wrapper (for project cards) */}
      {variant === 'project' ? <div className={styles.content}>{children}</div> : children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;
