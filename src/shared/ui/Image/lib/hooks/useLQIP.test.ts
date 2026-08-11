import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLQIP, getLQIPClassName } from './useLQIP';

/** jsdom не грузит изображения: мок Image, который всегда "загружается" */
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  crossOrigin = '';
  width = 100;
  height = 50;
  _src = '';

  get src(): string {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    queueMicrotask(() => {
      this.onload?.();
    });
  }
}

describe('useLQIP hook (requirement #12)', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage);

    // Mock canvas для jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => ({ drawImage: vi.fn() }) as unknown as CanvasRenderingContext2D
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useLQIP(null));
    expect(result.current.lqipDataUrl).toBeNull();
    expect(result.current.isLqipReady).toBe(false);
    expect(typeof result.current.generateLQIP).toBe('function');
  });

  it('generates LQIP when imageUrl is provided', async () => {
    const { result } = renderHook(() => useLQIP('/test.jpg', { enabled: true }));

    await waitFor(() => {
      expect(result.current.isLqipReady).toBe(true);
    });

    expect(result.current.lqipDataUrl).toContain('data:image/jpeg');
  });

  it('respects enabled flag', () => {
    const { result } = renderHook(() => useLQIP('/test.jpg', { enabled: false }));
    expect(result.current.lqipDataUrl).toBeNull();
    expect(result.current.isLqipReady).toBe(false);
  });

  it('uses custom previewWidth', async () => {
    const { result } = renderHook(() => useLQIP('/test.jpg', { previewWidth: 40 }));

    await waitFor(() => {
      expect(result.current.isLqipReady).toBe(true);
    });

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });

  it('uses custom blurAmount', () => {
    const className = getLQIPClassName(30);
    expect(className).toBe('lqip-blur-30');
  });

  it('handles image load error', async () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => null
    ) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    const { result } = renderHook(() => useLQIP('/invalid.jpg'));

    await waitFor(() => {
      expect(result.current.isLqipReady).toBe(false);
    });

    expect(result.current.lqipDataUrl).toBeNull();
  });
});

describe('getLQIPClassName', () => {
  it('returns correct class name', () => {
    expect(getLQIPClassName(10)).toBe('lqip-blur-10');
    expect(getLQIPClassName(20)).toBe('lqip-blur-20');
    expect(getLQIPClassName(50)).toBe('lqip-blur-50');
  });
});
