import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { useCopyCode } from './useCopyCode';

describe('useCopyCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('handleCopy — Clipboard API success', () => {
    it('вызывает clipboard.writeText с codeText', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('const x = 10;'));
      act(() => {
        result.current.handleCopy();
      });

      expect(writeText).toHaveBeenCalledWith('const x = 10;');
    });

    it('устанавливает isCopied = true после успешного копирования', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(result.current.isCopied).toBe(true);
      });
    });

    it('сбрасывает isCopied = false через 2000ms', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      return vi
        .waitFor(() => {
          expect(result.current.isCopied).toBe(true);
        })
        .then(() => {
          act(() => {
            vi.advanceTimersByTime(2000);
          });
          expect(result.current.isCopied).toBe(false);
        });
    });
  });

  describe('handleCopy — Clipboard API error', () => {
    it('устанавливает isError = true при ошибке clipboard', () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('не добавляет textarea в DOM (fallback с execCommand удалён)', () => {
      const writeText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      return vi
        .waitFor(() => {
          expect(result.current.isError).toBe(true);
        })
        .then(() => {
          // fallback не должен был создавать textarea
          const textareas = document.querySelectorAll('textarea');
          expect(textareas.length).toBe(0);
        });
    });
  });

  describe('handleCopy — Clipboard API недоступен', () => {
    it('устанавливает isError = true когда clipboard = undefined', () => {
      Object.assign(navigator, { clipboard: undefined });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      expect(result.current.isError).toBe(true);
    });

    it('не добавляет textarea в DOM при undefined clipboard', () => {
      Object.assign(navigator, { clipboard: undefined });

      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.handleCopy();
      });

      const textareas = document.querySelectorAll('textarea');
      expect(textareas.length).toBe(0);
    });
  });

  describe('options — onCopyResult', () => {
    it('вызывает onCopyResult(true) при успешном копировании', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      const onCopyResult = vi.fn();

      const { result } = renderHook(() => useCopyCode('test', { onCopyResult }));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(onCopyResult).toHaveBeenCalledWith(true);
      });
    });

    it('вызывает onCopyResult(false) при ошибке clipboard', () => {
      const writeText = vi.fn().mockRejectedValue(new Error('fail'));
      Object.assign(navigator, { clipboard: { writeText } });
      const onCopyResult = vi.fn();

      const { result } = renderHook(() => useCopyCode('test', { onCopyResult }));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(onCopyResult).toHaveBeenCalledWith(false);
      });
    });

    it('вызывает onCopyResult(false) когда clipboard = undefined', () => {
      Object.assign(navigator, { clipboard: undefined });
      const onCopyResult = vi.fn();

      const { result } = renderHook(() => useCopyCode('test', { onCopyResult }));
      act(() => {
        result.current.handleCopy();
      });

      expect(onCopyResult).toHaveBeenCalledWith(false);
    });
  });

  describe('options — onCopy callback', () => {
    it('вызывает onCopy при успешном копировании', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      const onCopy = vi.fn();

      const { result } = renderHook(() => useCopyCode('test', { onCopy }));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(onCopy).toHaveBeenCalledOnce();
      });
    });

    it('НЕ вызывает onCopy при ошибке', () => {
      const writeText = vi.fn().mockRejectedValue(new Error('fail'));
      Object.assign(navigator, { clipboard: { writeText } });
      const onCopy = vi.fn();

      const { result } = renderHook(() => useCopyCode('test', { onCopy }));
      act(() => {
        result.current.handleCopy();
      });

      return vi.waitFor(() => {
        expect(onCopy).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleCopy — тип возврата', () => {
    it('handleCopy возвращает void (не Promise)', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const { result } = renderHook(() => useCopyCode('test'));
      const returned = result.current.handleCopy();
      expect(returned).toBeUndefined();
    });
  });

  describe('reset / resetError', () => {
    it('reset сбрасывает isCopied в false', () => {
      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.reset();
      });
      expect(result.current.isCopied).toBe(false);
    });

    it('resetError сбрасывает isError в false', () => {
      const { result } = renderHook(() => useCopyCode('test'));
      act(() => {
        result.current.resetError();
      });
      expect(result.current.isError).toBe(false);
    });
  });

  describe('codeText — useMemo', () => {
    it('извлекает текст из ReactElement children', () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });

      const children = createElement('span', null, 'const');
      const { result } = renderHook(() => useCopyCode(children));
      act(() => {
        result.current.handleCopy();
      });

      expect(writeText).toHaveBeenCalledWith('const');
    });
  });
});
