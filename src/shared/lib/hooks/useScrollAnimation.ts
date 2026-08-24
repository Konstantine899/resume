// ============================================
// useScrollAnimation Hook
// ============================================

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { debounce, type DebouncedFunction } from '../utils/debounce';

export interface UseScrollAnimationOptions {
  /** Threshold for intersection (0-1) */
  threshold?: number;
  /** Root margin for intersection */
  rootMargin?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Trigger only once */
  triggerOnce?: boolean;
  /** Disable animation */
  disabled?: boolean;
  /** Debounce delay for scroll handler (ms) */
  debounceDelay?: number;
  /** Callback when animation starts */
  onAnimationStart?: () => void;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

export interface UseScrollAnimationReturn {
  ref: RefObject<HTMLElement | null>;
  isVisible: boolean;
  hasAnimated: boolean;
  isAnimating: boolean;
  triggerAnimation: () => void;
  resetAnimation: () => void;
}

export const useScrollAnimation = ({
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  delay = 0,
  duration = 700,
  triggerOnce = true,
  disabled = false,
  debounceDelay = 100,
  onAnimationStart,
  onAnimationComplete,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref for closure stability — mirrors hasAnimated so debounced callbacks
  // always read the current value instead of a stale closure capture
  const hasAnimatedRef = useRef(hasAnimated);
  useEffect(() => {
    hasAnimatedRef.current = hasAnimated;
  }, [hasAnimated]);

  // Validate threshold (0-1)
  const validThreshold = Math.max(0, Math.min(1, threshold));

  // Extract animation logic to avoid duplication
  const startAnimation = useCallback(() => {
    setIsVisible(true);
    setIsAnimating(true);
    onAnimationStart?.();

    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
      if (triggerOnce) {
        setHasAnimated(true);
      }
    }, duration);
  }, [duration, triggerOnce, onAnimationStart, onAnimationComplete]);

  // Handle intersection — reads hasAnimated from ref to avoid stale closure
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry) return;

      if (entry.isIntersecting && !hasAnimatedRef.current) {
        // Apply delay before triggering animation
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            if (elementRef.current) {
              startAnimation();
            }
          }, delay);
        } else {
          startAnimation();
        }

        // Unobserve if triggerOnce is enabled
        if (triggerOnce && elementRef.current && observerRef.current) {
          observerRef.current.unobserve(elementRef.current);
        }
      } else if (!triggerOnce && !entry.isIntersecting) {
        setIsVisible(false);
      }
    },
    [delay, triggerOnce, startAnimation]
  );

  // Ref that always points to the latest handleIntersection
  const handleIntersectionRef = useRef(handleIntersection);
  useEffect(() => {
    handleIntersectionRef.current = handleIntersection;
  }, [handleIntersection]);

  // Create debounced handler ONCE — only recreate when debounceDelay changes.
  // The inner callback reads handleIntersectionRef.current so it always
  // uses the latest handler without recreating the debounced wrapper.
  const debouncedHandlerRef = useRef<DebouncedFunction<
    (entries: IntersectionObserverEntry[]) => void
  > | null>(null);

  useEffect(() => {
    debouncedHandlerRef.current = debounce((entries: IntersectionObserverEntry[]) => {
      handleIntersectionRef.current(entries);
    }, debounceDelay);
  }, [debounceDelay]);

  // Initialize intersection observer with error handling
  useEffect(() => {
    if (disabled || !elementRef.current) {
      return;
    }

    try {
      observerRef.current = new IntersectionObserver(
        (entries) => debouncedHandlerRef.current?.(entries),
        {
          threshold: validThreshold,
          rootMargin,
        }
      );

      observerRef.current.observe(elementRef.current);
    } catch {
      // Fallback: trigger animation without observer (async to avoid cascading renders)
      setTimeout(() => {
        startAnimation();
      }, 0);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [disabled, validThreshold, rootMargin, startAnimation]);

  // Manually trigger animation
  const triggerAnimation = useCallback(() => {
    if (!hasAnimatedRef.current && !isAnimating) {
      startAnimation();
    }
  }, [isAnimating, startAnimation]);

  // Reset animation state
  const resetAnimation = useCallback(() => {
    setIsVisible(false);
    setHasAnimated(false);
    setIsAnimating(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    isAnimating,
    triggerAnimation,
    resetAnimation,
  };
};

export default useScrollAnimation;
