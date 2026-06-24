// ============================================
// InputClearButton Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputClearButtonProps {
  onClick: () => void;
  'aria-label'?: string;
  tabIndex?: number;
}

export const InputClearButton: React.FC<InputClearButtonProps> = ({
  onClick,
  'aria-label': ariaLabel = 'Clear input',
  tabIndex = -1,
}) => {
  return (
    <button
      type="button"
      className={styles.clearButton}
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

InputClearButton.displayName = 'InputClearButton';
