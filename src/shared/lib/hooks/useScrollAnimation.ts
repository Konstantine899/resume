// ============================================
// useScrollAnimation Hook
// ============================================

import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Options for the useScrollAnimation hook
 */
export interface UseScrollAnimationOptions {
  /**
   * Threshold for intersection (0-1)
   * @default 0.1
   */
  threshold?: number;
  
  /**
   * Root margin for intersection observer
   * @default '0px 0px -50px 0px'
   */
  rootMargin?: string;
  
  /**
   * Animation delay in milliseconds
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether to trigger animation only once
   * @default true
   */
  triggerOnce?: boolean;
  
  /**
   * Whether to disable the animation
   * @default false
   */
  disabled?: boolean;
}

/**
 * Return type for useScrollAnimation hook
 */
export interface UseScrollAnimationReturn {
  /**
   * Ref to attach to the element
   */
  ref: RefObject<HTMLElement | null>;
  
  /**
   * Whether the element is visible
   */
  isVisible: boolean;
  
  /**
   * Whether the animation has been triggered
   */
  hasAnimated: boolean;
  
  /**
   * Whether the animation is currently running
   */
  isAnimating: boolean;
  
  /**
   * Manually trigger the animation
   */
  triggerAnimation: () => void;
  
  /**
   * Reset the animation state
   */
  resetAnimation: () => void;
}

/**
 * A hook that triggers animations when an element scrolls into view
 * Uses Intersection Observer API for performance
 * 
 * @example
 * ```tsx
 * const { ref, isVisible } = useScrollAnimation();
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'visible' : ''}>
 *     Content
 *   </div>
 * );
 * ```
 */
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

  // Handle intersection observer callback
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && !hasAnimated) {
      setIsVisible(true);
      
      // Start animation after delay
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
        
        // Mark as animated after animation completes
        setTimeout(() => {
          setIsAnimating(false);
          if (triggerOnce) {
            setHasAnimated(true);
          }
        }, 700); // Default animation duration
      }, delay);
    } else if (!entry.isIntersecting && !triggerOnce) {
      setIsVisible(false);
      setHasAnimated(false);
      setIsAnimating(false);
    }
  };

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
  }, [threshold, rootMargin, delay, triggerOnce, disabled]);

  // Manually trigger animation
  const triggerAnimation = () => {
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
  };

  // Reset animation state
  const resetAnimation = () => {
    setIsVisible(false);
    setHasAnimated(false);
    setIsAnimating(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

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