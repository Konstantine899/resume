import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePasswordToggle } from './usePasswordToggle';
import React from 'react';

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

  it('handlePasswordToggleKeyDown triggers on Enter', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    const event = { key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handlePasswordToggleKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.showPassword).toBe(true);
  });

  it('handlePasswordToggleKeyDown triggers on Space', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    const event = { key: ' ', preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handlePasswordToggleKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.showPassword).toBe(true);
  });

  it('handlePasswordToggleKeyDown ignores other keys', () => {
    const { result } = renderHook(() =>
      usePasswordToggle({ type: 'password', showPasswordToggle: true })
    );
    const event = { key: 'Tab', preventDefault: vi.fn() } as unknown as React.KeyboardEvent;
    act(() => result.current.handlePasswordToggleKeyDown(event));
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.showPassword).toBe(false);
  });
});
