import { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { BadgeProps } from '../model/types';
import { BADGE_DEFAULTS, STATUS_VARIANTS, ARIA_LABEL_MAP } from '../model/constants';
import styles from './Badge.module.scss';

/**
 * Badge — display компонент для меток, статусов и тегов.
 *
 * Поддерживает 6 визуальных вариантов и 3 размера.
 * Автоматически добавляет role="status" для success/warning/error.
 */
export const Badge = ({
  children,
  variant = BADGE_DEFAULTS.variant,
  size = BADGE_DEFAULTS.size,
  disabled = BADGE_DEFAULTS.disabled,
  className,
  role: roleProp,
  'aria-label': ariaLabelProp,
  ...props
}: BadgeProps) => {
  const badgeClasses = useMemo(
    () => classNames(styles.badge, styles[variant], styles[size], className),
    [variant, size, className]
  );

  const isStatus = STATUS_VARIANTS.includes(variant);
  const role = roleProp ?? (isStatus ? 'status' : undefined);
  const ariaLabel = ariaLabelProp ?? ARIA_LABEL_MAP[variant];

  return (
    <span
      className={badgeClasses}
      role={role}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </span>
  );
};
