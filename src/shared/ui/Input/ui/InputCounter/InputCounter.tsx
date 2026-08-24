// ============================================
// InputCounter Component
// ============================================

import React from 'react';
import { INPUT_CONSTANTS } from '../../model/constants';
import styles from '../Input.module.scss';

export interface InputCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
  'data-testid'?: string;
}

/**
 * InputCounter — счётчик символов для Input с порогом предупреждения.
 *
 * @example
 * ```tsx
 * <InputCounter current={5} max={100} />
 * ```
 */
export const InputCounter = React.memo(
  ({
    current,
    max,
    warningThreshold = INPUT_CONSTANTS.COUNTER_WARNING_THRESHOLD,
    'data-testid': dataTestId,
  }: InputCounterProps) => {
    const isWarning = current >= max * warningThreshold;

    return (
      <span className={styles.counter} data-testid={dataTestId}>
        <span className={isWarning ? styles.warning : ''}>{current}</span>/{max}
      </span>
    );
  }
);

InputCounter.displayName = 'InputCounter';
