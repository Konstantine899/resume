import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useKeyboardAction } from './useKeyboardAction';

describe('useKeyboardAction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  /** Helper: attach the hook's onKeyDown handler to a real DOM element with onClick */
  function attach(
    handler: (event: React.KeyboardEvent<HTMLElement>) => void,
    onClick: () => void
  ): { element: HTMLElement; clickSpy: ReturnType<typeof vi.spyOn> } {
    const element = document.createElement('button');
    document.body.appendChild(element);
    element.onclick = onClick;
    const clickSpy = vi.spyOn(element, 'click').mockImplementation((() => {
      element.onclick?.(new MouseEvent('click') as never);
    }) as () => void);
    element.addEventListener('keydown', (e) =>
      handler(e as unknown as React.KeyboardEvent<HTMLElement>)
    );
    return { element, clickSpy };
  }

  it('Enter активирует onClick ровно один раз', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useKeyboardAction({ enabled: true }));
    const { element, clickSpy } = attach(result.current, onClick);

    act(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space активирует onClick ровно один раз', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useKeyboardAction({ enabled: true }));
    const { element, clickSpy } = attach(result.current, onClick);

    act(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('другие клавиши не активируют', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useKeyboardAction({ enabled: true }));
    const { element, clickSpy } = attach(result.current, onClick);

    act(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled не активирует', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useKeyboardAction({ disabled: true, enabled: true }));
    const { element, clickSpy } = attach(result.current, onClick);

    act(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('не активирует когда enabled=false', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useKeyboardAction({ enabled: false }));
    const { element, clickSpy } = attach(result.current, onClick);

    act(() => {
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(clickSpy).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
