import React from 'react';
import { BADGE_SIZES, STATUS_COLORS } from '../../model/constants';
import { AvatarBadgeProps } from '../../model/types';
import styles from './AvatarBadge.module.scss';

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  status = 'online',
  variant = 'dot',
  count,
  className = '',
}) => {
  const getBadgeContent = () => {
    switch (variant) {
      case 'number':
        return count && count > 0 ? (
          <span className={styles.count}>{count > 99 ? '99+' : count}</span>
        ) : null;
      case 'icon':
        return <div className={styles.icon} />;
      default:
        return null;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  };

  return (
    <div
      className={`${styles.badge} ${styles[variant]} ${styles[status]} ${className}`}
      style={{
        backgroundColor: STATUS_COLORS[status],
        width: variant === 'dot' ? BADGE_SIZES.md : 'auto',
        height: variant === 'dot' ? BADGE_SIZES.md : 'auto',
      }}
      role="status"
      aria-label={`Status: ${status}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {getBadgeContent()}
    </div>
  );
};
