// ============================================
// InputClearButton Component
// ============================================

import React, { forwardRef } from 'react';
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
  forwardRef<HTMLButtonElement, InputClearButtonProps>(
    ({ onClick, 'aria-label': ariaLabel = 'Clear input', tabIndex = 0 }, ref) => {
      return (
        <button
          type="button"
          ref={ref}
          className={styles.clearButton}
          onClick={onClick}
          aria-label={ariaLabel}
          tabIndex={tabIndex}
        >
          <ClearIcon />
        </button>
      );
    }
  )
);

InputClearButton.displayName = 'InputClearButton';
