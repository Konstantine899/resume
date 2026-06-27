import React from 'react';
import { AvatarStatusProps } from '../../model/types';
import styles from './AvatarStatus.module.scss';

export const AvatarStatus = React.memo(({ status, className = '' }: AvatarStatusProps) => {
  return <div className={`${styles.status} ${styles[status]} ${className}`} title={status} />;
});

AvatarStatus.displayName = 'AvatarStatus';
