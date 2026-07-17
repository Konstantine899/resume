// ============================================
// InputGroup Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';
import InputGroupAddon from './InputGroupAddon';

export type { InputGroupAddonProps } from './InputGroupAddon';

export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * InputGroup — контейнер для группировки Input с аддонами.
 * Включает вложенный компонент InputGroupAddon.
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroup.Addon position="start">$</InputGroup.Addon>
 *   <Input />
 *   <InputGroup.Addon position="end">.00</InputGroup.Addon>
 * </InputGroup>
 * ```
 */
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
  }
);

InputGroup.displayName = 'InputGroup';
