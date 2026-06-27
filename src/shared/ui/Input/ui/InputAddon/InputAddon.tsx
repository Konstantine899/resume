// ============================================
// InputAddon Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputAddonProps {
  children: React.ReactNode;
  position?: 'start' | 'end';
  className?: string;
  'data-testid'?: string;
}

export const InputAddon = React.memo(
  ({ children, position = 'start', className, 'data-testid': dataTestId }: InputAddonProps) => {
    const addonClass = position === 'start' ? styles.icon : styles.iconAfter;

    return (
      <span className={className || addonClass} aria-hidden="true" data-testid={dataTestId}>
        {children}
      </span>
    );
  }
);

InputAddon.displayName = 'InputAddon';
