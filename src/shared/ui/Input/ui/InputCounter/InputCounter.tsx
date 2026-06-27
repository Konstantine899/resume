// ============================================
// InputCounter Component
// ============================================

import React from 'react';
import styles from '../Input.module.scss';

export interface InputCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
  'data-testid'?: string;
}

export const InputCounter = React.memo(
  ({ current, max, warningThreshold = 0.9, 'data-testid': dataTestId }: InputCounterProps) => {
    const isWarning = current >= max * warningThreshold;

    return (
      <span className={styles.counter} data-testid={dataTestId}>
        <span className={isWarning ? styles.warning : ''}>{current}</span>/{max}
      </span>
    );
  }
);

InputCounter.displayName = 'InputCounter';
