import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePopover } from './usePopover';

const base = { position: 'bottom' as const, offset: 8 };

describe('usePopover', () => {
  it('toggles visibility via handleClick', () => {
    const { result } = renderHook(() => usePopover(base));
    expect(result.current.isVisible).toBe(false);
    act(() => result.current.handlers.handleClick({ stopPropagation: vi.fn() } as never));
    expect(result.current.isVisible).toBe(true);
    act(() => result.current.handlers.handleClick({ stopPropagation: vi.fn() } as never));
    expect(result.current.isVisible).toBe(false);
  });

  it('does not toggle when disabled', () => {
    const { result } = renderHook(() => usePopover({ ...base, disabled: true }));
    act(() => result.current.handlers.handleClick({ stopPropagation: vi.fn() } as never));
    expect(result.current.isVisible).toBe(false);
    expect(result.current.enabled).toBe(false);
  });

  it('toggles via handleKeyDown (Enter) and closes on Escape', () => {
    const { result } = renderHook(() => usePopover(base));
    act(() =>
      result.current.handlers.handleKeyDown({
        key: 'Enter',
        preventDefault: vi.fn(),
        repeat: false,
      } as never)
    );
    expect(result.current.isVisible).toBe(true);
    act(() =>
      result.current.handlers.handleKeyDown({
        key: 'Escape',
        preventDefault: vi.fn(),
        repeat: false,
      } as never)
    );
    expect(result.current.isVisible).toBe(false);
  });

  it('closes on content click when closeOnContentClick is set', () => {
    const { result } = renderHook(() => usePopover({ ...base, closeOnContentClick: true }));
    act(() => result.current.open());
    expect(result.current.isVisible).toBe(true);
    act(() => result.current.handlers.handleContentClick());
    expect(result.current.isVisible).toBe(false);
  });

  it('exposes open/close and shouldRender', () => {
    const { result } = renderHook(() => usePopover(base));
    act(() => result.current.open());
    expect(result.current.shouldRender).toBe(true);
    act(() => result.current.close());
    expect(result.current.shouldRender).toBe(false);
  });

  it('does not crash when called without options (defaults apply)', () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.isVisible).toBe(false);
    expect(result.current.adjustedPosition).toBe('top');
  });
});
