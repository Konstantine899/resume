import React, { Children } from 'react';
import { GROUP_SPACING } from '../../model/constants';
import { AvatarGroupProps, AvatarProps } from '../../model/types';
import styles from './AvatarGroup.module.scss';

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 4,
  size = 'md',
  variant = 'circle',
  className = '',
}) => {
  const avatars = Children.toArray(children);
  const totalAvatars = avatars.length;
  const visibleAvatars = avatars.slice(0, max);
  const hiddenCount = totalAvatars - max;

  return (
    <div className={`${styles.group} ${className}`}>
      {visibleAvatars.map((avatar, index) => {
        const avatarElement = avatar as React.ReactElement<AvatarProps>;
        return (
          <div
            key={index}
            className={styles.avatarWrapper}
            style={{
              marginLeft: index > 0 ? `${GROUP_SPACING[size]}px` : '0',
              zIndex: visibleAvatars.length - index,
            }}
          >
            {React.cloneElement(avatarElement, {
              size: avatarElement.props.size || size,
              variant: avatarElement.props.variant || variant,
            })}
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <div
          className={styles.remaining}
          style={{
            marginLeft: `${GROUP_SPACING[size]}px`,
            width: `${GROUP_SPACING[size] * -2}px`,
            height: `${GROUP_SPACING[size] * -2}px`,
          }}
        >
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};
