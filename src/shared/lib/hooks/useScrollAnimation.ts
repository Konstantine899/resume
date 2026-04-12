// ============================================
// useScrollAnimation Hook
// ============================================

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  triggerOnce?: boolean;
  disabled?: boolean;
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
  triggerOnce = true,
  disabled = false,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize callback to avoid re-creation on each render
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry) return;

      if (entry.isIntersecting) {
        // Apply delay before triggering animation
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            setIsAnimating(true);

            setTimeout(() => {
              setIsAnimating(false);
              if (triggerOnce) {
                setHasAnimated(true);
              }
            }, 700); // Match animation duration
          }, delay);
        } else {
          setIsVisible(true);
          setIsAnimating(true);

          setTimeout(() => {
            setIsAnimating(false);
            if (triggerOnce) {
              setHasAnimated(true);
            }
          }, 700);
        }

        // Unobserve if triggerOnce is enabled
        if (triggerOnce && elementRef.current && observerRef.current) {
          observerRef.current.unobserve(elementRef.current);
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    },
    [delay, triggerOnce]
  );

  // Initialize intersection observer
  useEffect(() => {
    if (disabled || !elementRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, threshold, rootMargin, disabled]);

  // Manually trigger animation
  const triggerAnimation = useCallback(() => {
    if (!hasAnimated) {
      setIsVisible(true);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);
        if (triggerOnce) {
          setHasAnimated(true);
        }
      }, 700);
    }
  }, [hasAnimated, triggerOnce]);

  // Reset animation state
  const resetAnimation = useCallback(() => {
    setIsVisible(false);
    setHasAnimated(false);
    setIsAnimating(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
