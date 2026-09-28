import { renderHook } from '@testing-library/react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useButton } from './useButton';
import type { UseButtonOptions } from './useButton';

const createDefaultOptions = (overrides: Partial<UseButtonOptions> = {}): UseButtonOptions => ({
  variant: 'primary',
  size: 'md',
  loading: false,
  loadingVariant: 'spinner',
  fullWidth: false,
  disabled: false,
  className: '',
  onClick: undefined,
  ...overrides,
});

describe('useButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('className computation', () => {
    it('должен возвращать className с variant и size классами', () => {
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ variant: 'primary', size: 'lg' }))
      );

      expect(result.current.buttonClassName).toContain('button');
      expect(result.current.buttonClassName).toContain('primary');
      expect(result.current.buttonClassName).toContain('lg');
    });

    it('должен добавлять loading класс при loading=true', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions({ loading: true })));

      expect(result.current.buttonClassName).toContain('loading');
    });

    it('должен добавлять fullWidth класс при fullWidth=true', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions({ fullWidth: true })));

      expect(result.current.buttonClassName).toContain('fullWidth');
    });

    it('должен включать кастомный className', () => {
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ className: 'my-custom-class' }))
      );

      expect(result.current.buttonClassName).toContain('my-custom-class');
    });
  });

  describe('contentClassName', () => {
    it('должен содержать content класс', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions()));

      expect(result.current.contentClassName).toContain('content');
    });

    it('не должен добавлять класс hidden при loading=true', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions({ loading: true })));

      // Content hiding while loading is handled by the `button-loading` CSS mixin on the
      // root element — no `.hidden` class exists in any Button SCSS module.
      expect(result.current.contentClassName).toContain('content');
      expect(result.current.contentClassName).not.toContain('hidden');
    });

    it('не должен добавлять hidden класс при loading=false', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions({ loading: false })));

      expect(result.current.contentClassName).not.toContain('hidden');
    });
  });

  describe('guarded click handler', () => {
    it('должен вызывать onClick при клике когда не disabled и не loading', () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ onClick: handleClick }))
      );

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
      result.current.handleClick(event);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled=true', () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ disabled: true, onClick: handleClick }))
      );

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
      result.current.handleClick(event);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading=true', () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ loading: true, onClick: handleClick }))
      );

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
      result.current.handleClick(event);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен вызывать preventDefault при disabled=true', () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ disabled: true, onClick: handleClick }))
      );

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
      result.current.handleClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('должен вызывать preventDefault при loading=true', () => {
      const handleClick = vi.fn();
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ loading: true, onClick: handleClick }))
      );

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;
      result.current.handleClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('не должен падать когда onClick не передан', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions()));

      const event = { preventDefault: vi.fn() } as unknown as React.MouseEvent;

      expect(() => result.current.handleClick(event)).not.toThrow();
    });
  });

  describe('guarded keyboard activation', () => {
    interface KeyEvent {
      key: string;
      defaultPrevented: boolean;
      preventDefault: ReturnType<typeof vi.fn>;
      currentTarget: { click: ReturnType<typeof vi.fn> };
    }

    const createKeyEvent = (key: string): KeyEvent => {
      const event: KeyEvent = {
        key,
        defaultPrevented: false,
        preventDefault: vi.fn(() => {
          event.defaultPrevented = true;
        }),
        currentTarget: { click: vi.fn() },
      };
      return event;
    };

    const press = (
      result: { current: ReturnType<typeof useButton> },
      event: KeyEvent
    ): KeyEvent => {
      result.current.handleKeyDown(event as unknown as ReactKeyboardEvent<HTMLElement>);
      return event;
    };

    it('должен активировать click по Enter', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions()));

      const event = press(result, createKeyEvent('Enter'));

      expect(event.currentTarget.click).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('должен активировать click по Space', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions()));

      const event = press(result, createKeyEvent(' '));

      expect(event.currentTarget.click).toHaveBeenCalledTimes(1);
    });

    it('не должен активировать по другой клавише', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions()));

      const event = press(result, createKeyEvent('ArrowDown'));

      expect(event.currentTarget.click).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('должен вызывать пользовательский onKeyDown до активации', () => {
      const onKeyDown = vi.fn();
      const { result } = renderHook(() => useButton(createDefaultOptions({ onKeyDown })));

      const event = press(result, createKeyEvent('Enter'));

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(event.currentTarget.click).toHaveBeenCalledTimes(1);
    });

    it('не должен активировать после preventDefault в пользовательском onKeyDown', () => {
      const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault());
      const { result } = renderHook(() => useButton(createDefaultOptions({ onKeyDown })));

      const event = press(result, createKeyEvent('Enter'));

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(event.currentTarget.click).not.toHaveBeenCalled();
    });
  });

  describe('loader rendering', () => {
    it('должен возвращать React элемент при loading=true', () => {
      const { result } = renderHook(() =>
        useButton(createDefaultOptions({ loading: true, loadingVariant: 'spinner' }))
      );

      expect(result.current.loader).not.toBeNull();
    });

    it('должен возвращать null при loading=false', () => {
      const { result } = renderHook(() => useButton(createDefaultOptions({ loading: false })));

      expect(result.current.loader).toBeNull();
    });
  });
});
