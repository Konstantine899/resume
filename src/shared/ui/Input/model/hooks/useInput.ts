import { useMemo, useState } from 'react';
import { INPUT_CONSTANTS } from '../constants';

export interface UseInputOptions {
  value?: string;
  defaultValue?: string;
  maxLength?: number;
  showCounter?: boolean;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  skeleton?: boolean;
}

export interface UseInputResult {
  value: string;
  isControlled: boolean;
  setInternalValue: (val: string) => void;
  charCount: number;
  showCharCounter: boolean;
  maxLengthValue: number | undefined;
  isWarning: boolean;
  states: string[];
  currentValue: string;
}

export function useInput(options: UseInputOptions): UseInputResult {
  const {
    value: propValue,
    defaultValue,
    maxLength,
    showCounter,
    loading,
    error,
    disabled,
    readOnly,
    skeleton,
  } = options;

  const isControlled = propValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(() =>
    isControlled ? String(propValue ?? '') : String(defaultValue ?? '')
  );
  const value = isControlled ? String(propValue ?? '') : internalValue;

  const currentValue = String(value ?? '');
  const maxLengthValue = maxLength;
  const charCount = currentValue.length;
  const showCharCounter = Boolean(showCounter && maxLengthValue !== undefined);
  const isWarning = Boolean(
    maxLengthValue && charCount >= maxLengthValue * INPUT_CONSTANTS.COUNTER_WARNING_THRESHOLD
  );

  const states = useMemo(() => {
    const result: string[] = [];
    if (loading) result.push('loading');
    if (error) result.push('error');
    if (disabled) result.push('disabled');
    if (readOnly) result.push('readonly');
    if (skeleton) result.push('skeleton');
    return result;
  }, [loading, error, disabled, readOnly, skeleton]);

  return {
    value,
    isControlled,
    setInternalValue,
    charCount,
    showCharCounter,
    maxLengthValue,
    isWarning,
    states,
    currentValue,
  };
}
