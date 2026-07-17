// ============================================
// InputAddon Component
// ============================================

import React from 'react';
import { classNames } from '@/shared/lib/utils';
import styles from '../Input.module.scss';

export interface InputAddonProps {
  children: React.ReactNode;
  position?: 'start' | 'end';
  className?: string;
  'data-testid'?: string;
}

/**
 * InputAddon — аддон (иконка/текст) до или после поля ввода Input.
 *
 * @example
 * ```tsx
 * <InputAddon position="start">$</InputAddon>
 * <InputAddon position="end">
 *   <SearchIcon />
 * </InputAddon>
 * ```
 */
export const InputAddon = React.memo(
  ({ children, position = 'start', className, 'data-testid': dataTestId }: InputAddonProps) => {
    const addonClass = position === 'start' ? styles.icon : styles.iconAfter;

    return (
      <span
        className={classNames(addonClass, className)}
        aria-hidden="true"
        data-testid={dataTestId}
      >
        {children}
      </span>
    );
  }
);

InputAddon.displayName = 'InputAddon';
