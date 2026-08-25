import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useImageDragDrop } from './useImageDragDrop';

const makeDragEvent = (items: { kind: string; type: string }[] = [], files: File[] = []) =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: { items, files },
  }) as unknown as React.DragEvent;

describe('useImageDragDrop', () => {
  afterEach(() => vi.clearAllMocks());

  it('sets isDragging on drag enter with image items', () => {
    const { result } = renderHook(() => useImageDragDrop());
    act(() => result.current.handleDragEnter(makeDragEvent([{ kind: 'file', type: 'image/png' }])));
    expect(result.current.isDragging).toBe(true);
  });

  it('ignores drag enter with non-image items', () => {
    const { result } = renderHook(() => useImageDragDrop());
    act(() =>
      result.current.handleDragEnter(makeDragEvent([{ kind: 'file', type: 'text/plain' }]))
    );
    expect(result.current.isDragging).toBe(false);
  });

  it('clears isDragging on drag leave', () => {
    const { result } = renderHook(() => useImageDragDrop());
    act(() => result.current.handleDragEnter(makeDragEvent([{ kind: 'file', type: 'image/png' }])));
    act(() => result.current.handleDragLeave(makeDragEvent()));
    expect(result.current.isDragging).toBe(false);
  });

  it('prevents default on drag over', () => {
    const { result } = renderHook(() => useImageDragDrop());
    const e = makeDragEvent();
    act(() => result.current.handleDragOver(e));
    expect(e.preventDefault as Mock).toHaveBeenCalled();
  });

  it('reports an error for an unsupported file type on drop', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useImageDragDrop({ onError }));
    act(() =>
      result.current.handleDrop(
        makeDragEvent([], [new File(['x'], 'a.txt', { type: 'text/plain' })])
      )
    );
    expect(result.current.error).not.toBeNull();
    expect(onError).toHaveBeenCalled();
  });

  it('reports an error for an oversized file on drop', () => {
    const onError = vi.fn();
    const big = new File([new Uint8Array(10 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    const { result } = renderHook(() => useImageDragDrop({ maxSizeMB: 1, onError }));
    act(() => result.current.handleDrop(makeDragEvent([], [big])));
    expect(result.current.error).not.toBeNull();
  });

  it('resets state', () => {
    const { result } = renderHook(() => useImageDragDrop());
    act(() => result.current.handleDragEnter(makeDragEvent([{ kind: 'file', type: 'image/png' }])));
    act(() => result.current.reset());
    expect(result.current.isDragging).toBe(false);
  });
});
