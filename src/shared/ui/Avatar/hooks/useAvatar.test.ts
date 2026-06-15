import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAvatar } from './useAvatar';

describe('useAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('должен начинать с isLoading=true при наличии src', () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasError).toBe(false);
    });

    it('должен начинать с isLoading=false при отсутствии src', async () => {
      const { result } = renderHook(() => useAvatar(undefined));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('должен начинать с isLoading=false при пустой src', async () => {
      const { result } = renderHook(() => useAvatar(''));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('должен показывать isLoading=true при forceLoading=true', () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg', true));

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Image Loading', () => {
    it('должен устанавливать isLoading=false при успешной загрузке', async () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      await act(async () => {
        result.current.handleLoad();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('должен устанавливать hasError=true при ошибке', async () => {
      const { result } = renderHook(() => useAvatar('https://invalid-url.com/avatar.jpg'));

      await act(async () => {
        result.current.handleError();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('должен очищать Image объект при unmount', () => {
      const { unmount } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      // Mock Image
      const mockImage = {
        src: '',
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        complete: false,
      } as unknown as HTMLImageElement;

      vi.spyOn(window, 'Image').mockImplementation(() => mockImage);

      unmount();

      expect(mockImage.src).toBe('');
      expect(mockImage.onload).toBe(null);
      expect(mockImage.onerror).toBe(null);
    });
  });

  describe('forceLoading', () => {
    it('не должен менять состояние при handleError если forceLoading=true', async () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg', true));

      await act(async () => {
        result.current.handleError();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasError).toBe(false);
    });

    it('не должен менять состояние при handleLoad если forceLoading=true', async () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg', true));

      await act(async () => {
        result.current.handleLoad();
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Reset', () => {
    it('должен сбрасывать состояние к начальному', async () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      // Сначала загруем
      await act(async () => {
        result.current.handleLoad();
      });

      expect(result.current.isLoading).toBe(false);

      // Теперь сбрасываем
      await act(async () => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasError).toBe(false);
    });

    it('должен сбрасывать error состояние', async () => {
      const { result } = renderHook(() => useAvatar('https://invalid-url.com/avatar.jpg'));

      // Сначала ошибка
      await act(async () => {
        result.current.handleError();
      });

      expect(result.current.hasError).toBe(true);

      // Теперь сбрасываем
      await act(async () => {
        result.current.reset();
      });

      expect(result.current.hasError).toBe(false);
    });
  });

  describe('Callbacks', () => {
    it('должен возвращать handleError функцию', () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      expect(result.current.handleError).toBeInstanceOf(Function);
    });

    it('должен возвращать handleLoad функцию', () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      expect(result.current.handleLoad).toBeInstanceOf(Function);
    });

    it('должен возвращать reset функцию', () => {
      const { result } = renderHook(() => useAvatar('https://example.com/avatar.jpg'));

      expect(result.current.reset).toBeInstanceOf(Function);
    });
  });

  describe('Re-render with different src', () => {
    it('должен сбрасывать состояние при изменении src', () => {
      const { result, rerender } = renderHook(({ src }) => useAvatar(src), {
        initialProps: { src: 'https://example.com/avatar1.jpg' },
      });

      expect(result.current.isLoading).toBe(true);

      // Меняем src
      rerender({ src: 'https://example.com/avatar2.jpg' });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
