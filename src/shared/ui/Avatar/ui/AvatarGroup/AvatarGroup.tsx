import React from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import styles from './AvatarGroup.module.scss';

export interface AvatarGroupProps {
  /** Дочерние Avatar компоненты */
  children: React.ReactNode;
  /** Максимальное количество отображаемых аватарок */
  max?: number;
  /** Размер аватарок */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Дополнительный CSS класс */
  className?: string;
  /** Текст для overflow indicator */
  overflowText?: string;
}

/**
 * AvatarGroup — группа аватарок с overflow indicator
 *
 * @example
 * ```tsx
 * <Avatar.Group max={3}>
 *   <Avatar src="/user1.jpg" alt="User 1" />
 *   <Avatar src="/user2.jpg" alt="User 2" />
 *   <Avatar src="/user3.jpg" alt="User 3" />
 *   <Avatar src="/user4.jpg" alt="User 4" />
 * </Avatar.Group>
 * ```
 */
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'md',
  className = '',
  overflowText = '+{{count}}',
}) => {
  const childArray = React.Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;
  const showOverflow = remainingCount > 0;

  const groupClasses = classNames(
    styles.group,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className
  );

  return (
    <div className={groupClasses} role="group" aria-label="Avatar group">
      {visibleAvatars.map((child, index) => (
        <div key={index} className={styles.avatar}>
          {child}
        </div>
      ))}
      {showOverflow && (
        <div className={styles.overflow} aria-label={`${remainingCount} more users`}>
          {overflowText.replace('{{count}}', String(remainingCount))}
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
