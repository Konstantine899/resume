import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  /** Helper: attach a real DOM element to the hook's ref */
  function attachElement(
    hookResult: { current: { ref: { current: HTMLElement | null } } },
    tagName = 'div'
  ): HTMLElement {
    const el = document.createElement(tagName);
    document.body.appendChild(el);
    // eslint-disable-next-line no-param-reassign
    hookResult.current.ref.current = el;
    return el;
  }

  it('вызывает callback при клике вне элемента', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const element = attachElement(result);
    const outside = document.createElement('button');
    document.body.appendChild(outside);

    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(element).toBeDefined();
  });

  it('НЕ вызывает callback при клике внутри элемента', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback));

    const element = attachElement(result);

    act(() => {
      element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('НЕ вызывает callback при клике на excludeRefs элемент', () => {
    const callback = vi.fn();
    const excluded = document.createElement('button');
    document.body.appendChild(excluded);

    const { result } = renderHook(() =>
      useClickOutside(callback, { excludeRefs: [{ current: excluded }] })
    );

    attachElement(result);

    act(() => {
      excluded.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('НЕ подписывается на события когда enabled=false', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useClickOutside(callback, { enabled }),
      { initialProps: { enabled: false } }
    );

    attachElement(result);
    const outside = document.createElement('button');
    document.body.appendChild(outside);

    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    expect(callback).not.toHaveBeenCalled();

    // После включения — начинает слушать
    rerender({ enabled: true });
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('использует указанный тип события', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useClickOutside(callback, { event: 'mousedown' }));

    attachElement(result);
    const outside = document.createElement('button');
    document.body.appendChild(outside);

    // pointerdown НЕ должен сработать при event='mousedown'
    act(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('не вызывает callback при отсутствии target', () => {
    const callback = vi.fn();
    renderHook(() => useClickOutside(callback));

    act(() => {
      const event = new PointerEvent('pointerdown');
      Object.defineProperty(event, 'target', { value: null });
      document.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('удаляет обработчик при размонтировании', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const callback = vi.fn();

    const { unmount } = renderHook(() => useClickOutside(callback));
    unmount();

    expect(removeSpy).toHaveBeenCalled();
  });
});
