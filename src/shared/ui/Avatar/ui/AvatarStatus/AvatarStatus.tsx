import React from 'react';
import { STATUS_COLORS } from '../../model/constants';
import { AvatarStatusProps } from '../../model/types';
import styles from './AvatarStatus.module.scss';

export const AvatarStatus: React.FC<AvatarStatusProps> = ({ status, className = '' }) => {
  return (
    <div
      className={`${styles.status} ${styles[status]} ${className}`}
      style={{ backgroundColor: STATUS_COLORS[status] }}
      title={status}
    />
  );
};
