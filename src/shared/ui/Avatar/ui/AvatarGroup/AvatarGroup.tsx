import React, { Children } from 'react';
import { GROUP_SPACING, SIZE_MAP } from '../../model/constants';
import { AvatarGroupProps, AvatarProps } from '../../model/types';
import styles from './AvatarGroup.module.scss';

export const AvatarGroup = React.memo(
  ({ children, max = 4, size = 'md', variant = 'circle', className = '' }: AvatarGroupProps) => {
    const avatars = Children.toArray(children);
    const totalAvatars = avatars.length;
    const visibleAvatars = avatars.slice(0, max);
    const hiddenCount = totalAvatars - max;

    return (
      <div className={`${styles.group} ${className}`} role="group" aria-label="Avatar group">
        {visibleAvatars.map((avatar, index) => {
          const avatarElement = avatar as React.ReactElement<AvatarProps>;
          return (
            <div
              key={index}
              className={styles.avatarWrapper}
              data-testid="avatar-wrapper"
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
              width: SIZE_MAP[size],
              height: SIZE_MAP[size],
            }}
          >
            +{hiddenCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
