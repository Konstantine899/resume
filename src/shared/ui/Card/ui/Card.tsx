// ============================================
// Card Component
// ============================================

import React from 'react';
import type { CardProps } from '../model/types';
import styles from './Card.module.scss';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'default',
  radius = '',
  fullWidth = false,
  hoverable = true,
  className = '',
  children,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[size],
    radius && styles[radius],
    fullWidth && styles.fullWidth,
    !hoverable && styles.noHover,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'project') {
    return <ProjectCard {...props} />;
  }

  if (variant === 'workHistory') {
    return <WorkHistoryCard {...props} />;
  }

  if (variant === 'contact') {
    return <ContactCard {...props} />;
  }

  return (
    <div className={cardClasses} {...props} role="group">
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export default Card;
