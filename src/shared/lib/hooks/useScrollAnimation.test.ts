import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, UseScrollAnimationOptions } from './useScrollAnimation';

// Mock IntersectionObserver with instance tracking
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  callback: (entries: IntersectionObserverEntry[]) => void;

  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries);
  }
}

describe('useScrollAnimation', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Helper: attach a real DOM element to the hook's ref and re-render to trigger observer setup */
  function attachRefAndRerender(
    hookResult: { current: { ref: { current: HTMLElement | null } } },
    rerender: (props: UseScrollAnimationOptions) => void,
    props: UseScrollAnimationOptions
  ) {
    // eslint-disable-next-line no-param-reassign
    hookResult.current.ref.current = document.createElement('div');
    rerender({ ...props, threshold: 0.2 });
  }

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

  // ============================================
  // Debounce Behavior Tests
  // ============================================
  describe('debounce behavior', () => {
    it('debounces rapid intersection events', () => {
      const onAnimationStart = vi.fn();

      const { result, rerender } = renderHook(
        (opts: UseScrollAnimationOptions) => useScrollAnimation(opts),
        {
          initialProps: {
            delay: 0,
            duration: 300,
            debounceDelay: 200,
            onAnimationStart,
          } as UseScrollAnimationOptions,
        }
      );

      attachRefAndRerender(result, rerender, {
        delay: 0,
        duration: 300,
        debounceDelay: 200,
        onAnimationStart,
      });

      const observer = MockIntersectionObserver.instances[0];
      expect(observer).toBeDefined();

      // Fire rapid intersection events
      act(() => {
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
      });

      // Should NOT have fired yet (debounce delay is 200ms)
      expect(onAnimationStart).not.toHaveBeenCalled();

      // Advance past debounce delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should have fired exactly once
      expect(onAnimationStart).toHaveBeenCalledTimes(1);
    });

    it('respects custom debounceDelay option', () => {
      const onAnimationStart = vi.fn();

      const { result, rerender } = renderHook(
        (opts: UseScrollAnimationOptions) => useScrollAnimation(opts),
        {
          initialProps: {
            delay: 0,
            duration: 300,
            debounceDelay: 500,
            onAnimationStart,
          } as UseScrollAnimationOptions,
        }
      );

      attachRefAndRerender(result, rerender, {
        delay: 0,
        duration: 300,
        debounceDelay: 500,
        onAnimationStart,
      });

      const observer = MockIntersectionObserver.instances[0];

      // Single intersection event
      act(() => {
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
      });

      // After 200ms — should NOT have fired (debounceDelay is 500ms)
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(onAnimationStart).not.toHaveBeenCalled();

      // After another 300ms (500ms total) — should fire
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onAnimationStart).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Observer Stability Tests
  // ============================================
  describe('observer stability', () => {
    it('does not recreate observer when hasAnimated becomes true', () => {
      const onAnimationStart = vi.fn();

      const { result, rerender } = renderHook(
        (opts: UseScrollAnimationOptions) => useScrollAnimation(opts),
        {
          initialProps: {
            triggerOnce: true,
            duration: 300,
            debounceDelay: 100,
            onAnimationStart,
          } as UseScrollAnimationOptions,
        }
      );

      attachRefAndRerender(result, rerender, {
        triggerOnce: true,
        duration: 300,
        debounceDelay: 100,
        onAnimationStart,
      });

      const observer = MockIntersectionObserver.instances[0];
      expect(observer).toBeDefined();

      const disconnectSpy = observer?.disconnect;

      // Trigger intersection → animation starts
      act(() => {
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
      });

      // Advance past debounce delay
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(onAnimationStart).toHaveBeenCalledTimes(1);

      // Advance past animation duration → hasAnimated becomes true
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Observer should NOT have been disconnected when hasAnimated changed
      expect(disconnectSpy).not.toHaveBeenCalled();

      // Fire another intersection (should be ignored due to hasAnimated)
      act(() => {
        observer?.trigger([{ isIntersecting: true } as IntersectionObserverEntry]);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Animation should still have been called only once
      expect(onAnimationStart).toHaveBeenCalledTimes(1);
    });
  });
});
