// ============================================
// AvatarFallback Component
// ============================================

import React from 'react';
import { AvatarFallbackProps } from '../../model/types';
import { getInitials } from '@/shared/lib/utils';
import { getFallbackColor } from '@/shared/ui/Avatar/lib/utils/getFallbackColor';
import { getFallbackTextColor } from '@/shared/ui/Avatar/lib/utils/getFallbackTextColor';
import { classNames } from '@/shared/lib/utils/classNames';

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
    fillContainer = false,
  }: AvatarFallbackProps) => {
    const initials = getInitials(name, { maxInitials });
    const backgroundColor = fillContainer ? undefined : getFallbackColor(name);
    const textColor = backgroundColor ? getFallbackTextColor(backgroundColor) : undefined;

    return (
      <div
        className={classNames(
          styles.fallback ?? '',
          styles[size] ?? '',
          styles[variant] ?? '',
          className,
          {
            [styles.fillContainer ?? '']: fillContainer,
          }
        )}
        style={backgroundColor && textColor ? { backgroundColor, color: textColor } : undefined}
        aria-hidden="true"
      >
        <span className={styles.initials ?? ''}>{initials}</span>
      </div>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';
