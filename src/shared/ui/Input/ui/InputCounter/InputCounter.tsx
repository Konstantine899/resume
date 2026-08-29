// ============================================
// InputCounter Component
// ============================================

import React, { forwardRef } from 'react';
import { INPUT_CONSTANTS } from '../../model/constants';
import styles from '../Input.module.scss';

export interface InputCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
  'data-testid'?: string;
  id?: string;
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
  forwardRef<HTMLSpanElement, InputCounterProps>(
    (
      {
        current,
        max,
        warningThreshold = INPUT_CONSTANTS.COUNTER_WARNING_THRESHOLD,
        'data-testid': dataTestId,
        id,
      },
      ref
    ) => {
      const isWarning = current >= max * warningThreshold;

      return (
        <span
          ref={ref}
          id={id}
          className={styles.counter}
          data-testid={dataTestId}
          aria-live="polite"
        >
          <span className={isWarning ? styles.warning : ''}>{current}</span>/{max}
        </span>
      );
    }
  )
);

InputCounter.displayName = 'InputCounter';
