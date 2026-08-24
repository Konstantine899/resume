import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageDragDrop } from './useImageDragDrop';

describe('useImageDragDrop hook (requirement #14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useImageDragDrop());
    expect(result.current.isDragging).toBe(false);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('handles drag enter with valid image', () => {
    const { result } = renderHook(() => useImageDragDrop());

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        items: [{ kind: 'file', type: 'image/jpeg' } as DataTransferItem],
      },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragEnter(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles drag leave', () => {
    const { result } = renderHook(() => useImageDragDrop());

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragEnter(mockEvent);
      result.current.handleDragLeave(mockEvent);
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('handles drag over', () => {
    const { result } = renderHook(() => useImageDragDrop());

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('rejects file with unsupported type', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useImageDragDrop({ onError }));

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [new File(['test'], 'test.txt', { type: 'text/plain' })],
      },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDrop(mockEvent);
    });

    expect(result.current.error).toContain('Unsupported file type');
    expect(onError).toHaveBeenCalled();
  });

  it('rejects file that is too large', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useImageDragDrop({ maxSizeMB: 1, onError }));

    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [largeFile] },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDrop(mockEvent);
    });

    expect(result.current.error).toContain('File too large');
    expect(onError).toHaveBeenCalled();
  });

  it('resets state', () => {
    const { result } = renderHook(() => useImageDragDrop());

    act(() => {
      result.current.reset();
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
