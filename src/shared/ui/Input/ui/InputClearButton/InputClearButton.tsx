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
  ({ onClick, 'aria-label': ariaLabel = 'Clear input', tabIndex = -1 }: InputClearButtonProps) => {
    return (
      <button
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
