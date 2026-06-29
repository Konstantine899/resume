import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation } from './useScrollAnimation';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(private callback: (entries: IntersectionObserverEntry[]) => void) {}
  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries);
  }
}

describe('useScrollAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns ref and initial state', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.ref).toBeDefined();
    expect(result.current.isVisible).toBe(false);
    expect(result.current.hasAnimated).toBe(false);
    expect(result.current.isAnimating).toBe(false);
  });

  it('has triggerAnimation and resetAnimation methods', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.triggerAnimation).toBeInstanceOf(Function);
    expect(result.current.resetAnimation).toBeInstanceOf(Function);
  });

  it('triggers animation and completes after duration', () => {
    const { result } = renderHook(() =>
      useScrollAnimation({ triggerOnce: true, delay: 0, duration: 700 })
    );

    act(() => {
      result.current.triggerAnimation();
    });

    // Fast-forward duration
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.hasAnimated).toBe(true);
  });

  it('respects delay option', () => {
    const { result } = renderHook(() =>
      useScrollAnimation({ delay: 500, duration: 300, triggerOnce: true })
    );

    act(() => {
      result.current.triggerAnimation();
    });

    // After delay + duration
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.hasAnimated).toBe(true);
  });

  it('respects duration option', () => {
    const { result } = renderHook(() => useScrollAnimation({ duration: 1000, triggerOnce: true }));

    act(() => {
      result.current.triggerAnimation();
    });

    // During animation
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isAnimating).toBe(true);

    // After duration
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isAnimating).toBe(false);
  });

  it('triggers only once when triggerOnce is true', () => {
    const { result } = renderHook(() => useScrollAnimation({ triggerOnce: true }));

    act(() => {
      result.current.triggerAnimation();
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current.hasAnimated).toBe(true);

    // Try to trigger again
    act(() => {
      result.current.triggerAnimation();
    });
    expect(result.current.hasAnimated).toBe(true); // Should not change
  });

  it('does not set hasAnimated when triggerOnce is false', () => {
    const { result } = renderHook(() => useScrollAnimation({ triggerOnce: false }));

    act(() => {
      result.current.triggerAnimation();
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.hasAnimated).toBe(false);
    expect(result.current.isVisible).toBe(true);
  });

  it('can reset animation state', () => {
    const { result } = renderHook(() => useScrollAnimation({ triggerOnce: false }));

    act(() => {
      result.current.triggerAnimation();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.resetAnimation();
    });
    expect(result.current.isVisible).toBe(false);
    expect(result.current.isAnimating).toBe(false);
  });

  it('calls onAnimationStart callback', () => {
    const onStart = vi.fn();
    const { result } = renderHook(() => useScrollAnimation({ onAnimationStart: onStart }));

    act(() => {
      result.current.triggerAnimation();
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onAnimationComplete callback', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useScrollAnimation({ onAnimationComplete: onComplete }));

    act(() => {
      result.current.triggerAnimation();
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('validates threshold (0-1)', () => {
    // Should not throw with invalid threshold
    expect(() => renderHook(() => useScrollAnimation({ threshold: -1 }))).not.toThrow();
    expect(() => renderHook(() => useScrollAnimation({ threshold: 2 }))).not.toThrow();
  });

  it('respects disabled option (no scroll trigger)', () => {
    const { result } = renderHook(() => useScrollAnimation({ disabled: true }));

    // disabled=true prevents IntersectionObserver setup
    // but manual triggerAnimation still works
    expect(result.current.ref).toBeDefined();

    // Manual trigger should still work
    act(() => {
      result.current.triggerAnimation();
    });
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(result.current.isVisible).toBe(true);
  });
});
