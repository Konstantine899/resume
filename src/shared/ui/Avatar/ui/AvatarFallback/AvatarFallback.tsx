import React from 'react';
import { FALLBACK_COLORS } from '../../model/constants';
import { AvatarFallbackProps } from '../../model/types';
import styles from './AvatarFallback.module.scss';

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  name = 'U',
  size = 'md',
  className = '',
}) => {
  const getInitials = (name: string): string => {
    const names = name.split(' ');
    if (names.length === 1) return name.charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const getColor = (name: string): string => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getColor(name);

  return (
    <div
      className={`${styles.fallback} ${styles[size]} ${className}`}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <span className={styles.initials}>{initials}</span>
    </div>
  );
};
