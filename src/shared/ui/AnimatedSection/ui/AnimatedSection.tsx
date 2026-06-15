import React, { useEffect, useRef, useReducer, useCallback } from 'react';
import type { AnimatedSectionProps, AnimationState, AnimationAction } from '../model/types';
import styles from './AnimatedSection.module.scss';

const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
  switch (action.type) {
    case 'SET_VISIBLE':
      return { ...state, isVisible: true };
    case 'START':
      return { ...state, isAnimating: true };
    case 'COMPLETE':
      return { ...state, isAnimating: false, hasAnimated: true };
    case 'RESET':
      return { isVisible: false, hasAnimated: false, isAnimating: false };
    default:
      return state;
  }
};

const initialState: AnimationState = {
  isVisible: false,
  hasAnimated: false,
  isAnimating: false,
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'fadeUp',
  trigger = 'onScroll',
  delay = 0,
  duration = 700,
  className = '',
  threshold = 0.1,
  animate,
  onAnimationStart,
  onAnimationComplete,
  as: Component = 'div',
  ...props
}) => {
  const [animationState, dispatch] = useReducer(animationReducer, initialState);

  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  const hasAnimatedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const animateRef = useRef(animate);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    hasAnimatedRef.current = animationState.hasAnimated;
    isAnimatingRef.current = animationState.isAnimating;
  }, [animationState.hasAnimated, animationState.isAnimating]);

  const clearAllTimeouts = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);

  const handleAnimationStart = useCallback(() => {
    if (isAnimatingRef.current) return;

    dispatch({ type: 'START' });
    onAnimationStart?.();

    clearAllTimeouts();

    completionTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch({ type: 'COMPLETE' });
        onAnimationComplete?.();
      }
    }, duration);
  }, [duration, onAnimationStart, onAnimationComplete, clearAllTimeouts]);

  const startAnimationWithDelay = useCallback(() => {
    if (hasAnimatedRef.current) return;

    dispatch({ type: 'SET_VISIBLE' });

    animationTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        handleAnimationStart();
      }
    }, delay);
  }, [delay, handleAnimationStart]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && !hasAnimatedRef.current) {
        startAnimationWithDelay();

        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    },
    [startAnimationWithDelay]
  );

  useEffect(() => {
    if (trigger !== 'onScroll' || !elementRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin: '0px 0px -50px 0px',
    });

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearAllTimeouts();
    };
  }, [trigger, threshold, handleIntersection, clearAllTimeouts]);

  useEffect(() => {
    if (trigger === 'manual' && animateRef.current && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }
  }, [trigger, animate, startAnimationWithDelay]);

  useEffect(() => {
    if (trigger === 'onMount' && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }
  }, [trigger, startAnimationWithDelay]);

  const handleMouseEnter = useCallback(() => {
    if (trigger === 'onHover' && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }
  }, [trigger, startAnimationWithDelay]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [clearAllTimeouts]);

  const animationClasses = [
    styles.animatedSection,
    styles[animation],
    animationState.isVisible && styles.visible,
    animationState.isAnimating && styles.animating,
    animationState.hasAnimated && styles.animated,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyles = {
    '--animation-delay': `${delay}ms`,
    '--animation-duration': `${duration}ms`,
  } as React.CSSProperties;

  const ComponentElement = Component as React.ElementType;

  return (
    <ComponentElement
      ref={elementRef as React.Ref<HTMLElement>}
      className={animationClasses}
      style={inlineStyles}
      onMouseEnter={trigger === 'onHover' ? handleMouseEnter : undefined}
      data-testid="animated-section"
      {...props}
    >
      {children}
    </ComponentElement>
  );
};

AnimatedSection.displayName = 'AnimatedSection';

export default AnimatedSection;
