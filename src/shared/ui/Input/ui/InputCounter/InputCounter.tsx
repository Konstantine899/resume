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
  id?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

/**
 * InputCounter — счётчик символов для Input с порогом предупреждения.
 * Announced politely via role="status" so screen readers learn the count.
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
    id,
    ref,
  }: InputCounterProps) => {
    const isWarning = current >= max * warningThreshold;

    return (
      <span
        ref={ref}
        id={id}
        className={styles.counter}
        data-testid={dataTestId}
        role="status"
        aria-live="polite"
      >
        <span className={isWarning ? styles.warning : ''}>{current}</span>/{max}
      </span>
    );
  }
);

InputCounter.displayName = 'InputCounter';
