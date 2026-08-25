import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useImageLoading } from './useImageLoading';

describe('useImageLoading', () => {
  it('starts in loading state and transitions to loaded on onLoad', () => {
    const { result } = renderHook(() => useImageLoading({ src: 'x', lazyMode: 'eager' }));
    expect(result.current.loadingStatus).toBe('loading');
    act(() => result.current.onLoad({} as never));
    expect(result.current.loadingStatus).toBe('loaded');
    expect(result.current.isLoaded).toBe(true);
  });

  it('transitions to error on onError', () => {
    const { result } = renderHook(() => useImageLoading({ src: 'x', lazyMode: 'eager' }));
    act(() => result.current.onError({} as never));
    expect(result.current.loadingStatus).toBe('error');
    expect(result.current.isError).toBe(true);
  });

  it('startLoading only starts from idle/error', () => {
    const { result } = renderHook(() => useImageLoading({ src: 'x', lazyMode: 'eager' }));
    act(() => result.current.onLoad({} as never));
    act(() => result.current.startLoading());
    expect(result.current.loadingStatus).toBe('loaded');
    act(() => result.current.reset());
    act(() => result.current.startLoading());
    expect(result.current.loadingStatus).toBe('loading');
  });

  it('forceLoading overrides display status to loading and makes onLoad a no-op', () => {
    const { result } = renderHook(() =>
      useImageLoading({ src: 'x', lazyMode: 'eager', forceLoading: true })
    );
    expect(result.current.isLoading).toBe(true);
    act(() => result.current.onLoad({} as never));
    expect(result.current.loadingStatus).toBe('loading');
  });
});
