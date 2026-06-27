import React from 'react';
import { AvatarSize } from '../../model/types';
import styles from './AvatarSpinner.module.scss';

export interface AvatarSpinnerProps {
  size?: AvatarSize;
  'aria-label'?: string;
}

export const AvatarSpinner: React.FC<AvatarSpinnerProps> = ({
  size = 'xl',
  'aria-label': ariaLabel = 'Loading',
}) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <div className={styles.outerRing} />
      <div className={styles.innerRing} />
    </div>
  );
};

AvatarSpinner.displayName = 'AvatarSpinner';
