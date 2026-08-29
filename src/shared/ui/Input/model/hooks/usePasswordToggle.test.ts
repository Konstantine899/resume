import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePasswordToggle } from './usePasswordToggle';

describe('usePasswordToggle', () => {
  it('returns inputType as-is when type is not password', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'email', showPasswordToggle: false })
    );
    expect(result.current.inputType).toBe('email');
    expect(result.current.isPassword).toBe(false);
  });

  it('detects password type', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    expect(result.current.isPassword).toBe(true);
    expect(result.current.inputType).toBe('password');
  });

  it('toggles inputType from password to text', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    expect(result.current.inputType).toBe('password');
    act(() => result.current.handleTogglePassword());
    expect(result.current.inputType).toBe('text');
  });

  it('toggles showPassword state', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    expect(result.current.showPassword).toBe(false);
    act(() => result.current.handleTogglePassword());
    expect(result.current.showPassword).toBe(true);
    act(() => result.current.handleTogglePassword());
    expect(result.current.showPassword).toBe(false);
  });

  it('toggles via the button click handler only (no keydown double-toggle)', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    // The native <button> handles Enter/Space; the hook must NOT expose a separate keydown handler.
    expect(
      (result.current as unknown as Record<string, unknown>).handlePasswordToggleKeyDown
    ).toBeUndefined();
    act(() => result.current.handleTogglePassword());
    expect(result.current.showPassword).toBe(true);
  });
});
