import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInput } from './useInput';

describe('useInput', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useInput({ defaultValue: 'hello' }));
    expect(result.current.value).toBe('hello');
    expect(result.current.isControlled).toBe(false);
  });

  it('treats value prop as controlled', () => {
    const { result } = renderHook(() => useInput({ value: 'controlled' }));
    expect(result.current.value).toBe('controlled');
    expect(result.current.isControlled).toBe(true);
  });

  it('updates internal value via setInternalValue', () => {
    const { result } = renderHook(() => useInput({}));
    act(() => result.current.setInternalValue('new'));
    expect(result.current.value).toBe('new');
  });

  it('does not change value through setInternalValue when controlled', () => {
    const { result } = renderHook(() => useInput({ value: 'fixed' }));
    act(() => result.current.setInternalValue('changed'));
    expect(result.current.value).toBe('fixed');
  });

  it('computes charCount correctly', () => {
    const { result } = renderHook(() => useInput({ defaultValue: 'abc' }));
    expect(result.current.charCount).toBe(3);
  });

  it('shows char counter only when showCounter and maxLength are set', () => {
    const { result: r1 } = renderHook(() => useInput({ showCounter: false }));
    expect(r1.current.showCharCounter).toBe(false);

    const { result: r2 } = renderHook(() => useInput({ showCounter: true }));
    expect(r2.current.showCharCounter).toBe(false);

    const { result: r3 } = renderHook(() => useInput({ showCounter: true, maxLength: 100 }));
    expect(r3.current.showCharCounter).toBe(true);
  });

  it('computes isWarning when near maxLength', () => {
    const { result } = renderHook(() =>
      useInput({ defaultValue: 'a'.repeat(95), maxLength: 100, showCounter: true })
    );
    expect(result.current.isWarning).toBe(true);
  });

  it('isWarning is false when under 90% threshold', () => {
    const { result } = renderHook(() =>
      useInput({ defaultValue: 'abc', maxLength: 100, showCounter: true })
    );
    expect(result.current.isWarning).toBe(false);
  });

  it('builds states array from loading/error/disabled/readonly/skeleton', () => {
    const { result: r1 } = renderHook(() => useInput({ loading: true, error: 'err' }));
    expect(r1.current.states).toEqual(['loading', 'error']);

    const { result: r2 } = renderHook(() =>
      useInput({ disabled: true, readOnly: true, skeleton: true })
    );
    expect(r2.current.states).toEqual(['disabled', 'readonly', 'skeleton']);

    const { result: r3 } = renderHook(() => useInput({}));
    expect(r3.current.states).toEqual([]);
  });
});
