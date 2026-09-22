import { classNames } from '@/shared/lib/utils/classNames';
import type { AvatarSize } from '../../model/types';
import styles from './AvatarBadge.module.scss';

export type AvatarBadgeStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarBadgeProps {
  /** Статус присутствия */
  status?: AvatarBadgeStatus;
  /** Размер аватара (для масштабирования badge) */
  size?: AvatarSize;
  /** Дополнительный CSS класс */
  className?: string;
  /** Aria label для доступности */
  'aria-label'?: string;
}

const BADGE_SIZES: Record<AvatarSize, string> = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '20px',
};

/**
 * AvatarBadge — индикатор присутствия для аватара
 *
 * @example
 * ```tsx
 * <AvatarBadge status="online" size="md" />
 * ```
 */
export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  status = 'offline',
  size = 'md',
  className = '',
  'aria-label': ariaLabel = `Status: ${status}`,
}) => {
  const badgeSize = BADGE_SIZES[size];

  const badgeClasses = classNames(
    styles.badge,
    styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`],
    className
  );

  return (
    <span
      className={badgeClasses}
      style={{
        width: badgeSize,
        height: badgeSize,
      }}
      role="status"
      aria-label={ariaLabel}
    />
  );
};

AvatarBadge.displayName = 'AvatarBadge';
