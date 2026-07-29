// ============================================
// AvatarFallback Component
// ============================================

import React from 'react';
import { AvatarFallbackProps } from '../../model/types';
import { getInitials } from '@/shared/lib/utils';
import { getFallbackColor } from '@/shared/ui/Avatar/lib/getFallbackColor';

import styles from './AvatarFallback.module.scss';

/**
 * AvatarFallback Component — displays initials with colored background
 *
 * @example
 * // Basic usage
 * ```tsx
 * <AvatarFallback name="John Doe" size="md" />
 * ```
 *
 * @example
 * // Custom initials
 * ```tsx
 * <AvatarFallback name="JD" maxInitials={2} />
 * ```
 */
export const AvatarFallback = React.memo(
  ({
    name = 'U',
    size = 'md',
    variant = 'circle',
    maxInitials = 2,
    className = '',
  }: AvatarFallbackProps) => {
    const initials = getInitials(name, { maxInitials });
    const backgroundColor = getFallbackColor(name);

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
