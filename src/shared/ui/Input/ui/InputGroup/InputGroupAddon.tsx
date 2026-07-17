// ============================================
// InputGroupAddon Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputGroupAddonProps {
  children: React.ReactNode;
  position?: 'start' | 'end';
  className?: string;
  'data-testid'?: string;
}

const InputGroupAddon = React.memo(
  ({
    children,
    position = 'start',
    className,
    'data-testid': dataTestId,
  }: InputGroupAddonProps) => {
    const addonClass = position === 'start' ? styles.addonStart : styles.addonEnd;

    return (
      <span className={className || addonClass} data-testid={dataTestId}>
        {children}
      </span>
    );
  }
);

InputGroupAddon.displayName = 'InputGroupAddon';

export default InputGroupAddon;
