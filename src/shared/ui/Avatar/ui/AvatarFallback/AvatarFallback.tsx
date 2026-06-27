import React from 'react';
import { FALLBACK_COLORS } from '../../model/constants';
import { AvatarFallbackProps } from '../../model/types';
import { getInitials } from '@/shared/lib/utils';

import styles from './AvatarFallback.module.scss';

export const AvatarFallback = React.memo(
  ({
    name = 'U',
    size = 'md',
    variant = 'circle',
    maxInitials = 2,
    className = '',
  }: AvatarFallbackProps) => {
    const getColor = (name: string): string => {
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
    };

    const initials = getInitials(name, { maxInitials });
    const backgroundColor = getColor(name);

    return (
      <div
        className={`${styles.fallback} ${styles[size]} ${styles[variant]} ${className}`}
        style={{ backgroundColor }}
        aria-hidden="true"
      >
        <span className={styles.initials}>{initials}</span>
      </div>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';
