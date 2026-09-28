// ============================================
// InputClearButton Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';
import { ClearIcon } from './InputClearIcon';

export interface InputClearButtonProps {
  onClick: () => void;
  'aria-label'?: string;
  tabIndex?: number;
  ref?: React.Ref<HTMLButtonElement>;
}

/**
 * InputClearButton — кнопка очистки значения Input.
 *
 * @example
 * ```tsx
 * <InputClearButton onClick={handleClear} />
 * ```
 */
export const InputClearButton = React.memo(
  ({
    onClick,
    'aria-label': ariaLabel = 'Clear input',
    tabIndex = 0,
    ref,
  }: InputClearButtonProps) => {
    return (
      <button
        ref={ref}
        type="button"
        className={styles.clearButton}
        onClick={onClick}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
      >
        <ClearIcon />
      </button>
    );
  }
);

InputClearButton.displayName = 'InputClearButton';
