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

export interface InputGroupAddonProps {
  children: React.ReactNode;
  position?: 'start' | 'end';
  className?: string;
  'data-testid'?: string;
}

// Sub-component for addons
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

export const InputGroup = Object.assign(
  React.memo(({ children, className, 'data-testid': dataTestId }: InputGroupProps) => {
    return (
      <div className={className || styles.inputGroup} data-testid={dataTestId}>
        {children}
      </div>
    );
  }),
  {
    Addon: InputGroupAddon,
    displayName: 'InputGroup',
  }
);
