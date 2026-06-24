// ============================================
// InputGroup Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const InputGroup: React.FC<InputGroupProps> & {
  Addon: typeof InputGroupAddon;
} = ({ children, className, 'data-testid': dataTestId }) => {
  return (
    <div className={styles.inputGroup} data-testid={dataTestId}>
      {children}
    </div>
  );
};

// Sub-component for addons
const InputGroupAddon: React.FC<{
  children: React.ReactNode;
  position?: 'start' | 'end';
  className?: string;
  'data-testid'?: string;
}> = ({ children, position = 'start', className, 'data-testid': dataTestId }) => {
  const addonClass = position === 'start' ? styles.addonStart : styles.addonEnd;

  return (
    <span className={className || addonClass} data-testid={dataTestId}>
      {children}
    </span>
  );
};

InputGroup.Addon = InputGroupAddon;
InputGroup.displayName = 'InputGroup';
