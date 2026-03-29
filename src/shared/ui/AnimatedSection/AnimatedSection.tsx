// ============================================
// AnimatedSection Component
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import styles from './AnimatedSection.module.scss';
import type { AnimatedSectionProps, AnimationState } from './types';

/**
 * AnimatedSection Component
 * 
 * A wrapper component that adds scroll-triggered animations to its children.
 * Uses Intersection Observer API for performance.
 * 
 * @example
 * ```tsx
 * <AnimatedSection animation="fadeUp" delay={100}>
 *   <div>Content to animate</div>
 * </AnimatedSection>
 * ```
 */
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
  const [animationState, setAnimationState] = useState<AnimationState>({
    isVisible: false,
    hasAnimated: false,
    isAnimating: false,
  });
  
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle animation start
  const handleAnimationStart = () => {
    setAnimationState(prev => ({ ...prev, isAnimating: true }));
    onAnimationStart?.();
    
    // Set timeout for animation completion
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setAnimationState(prev => ({ 
        ...prev, 
        isAnimating: false, 
        hasAnimated: true 
      }));
      onAnimationComplete?.();
    }, duration);
  };

  // Handle intersection observer callback
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && !animationState.hasAnimated) {
      setAnimationState(prev => ({ ...prev, isVisible: true }));
      
      // Start animation after delay
      setTimeout(() => {
        handleAnimationStart();
      }, delay);
    }
  };

  // Initialize intersection observer
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trigger, threshold, delay]);

  // Handle manual animation trigger
  useEffect(() => {
    if (trigger === 'manual' && animate && !animationState.hasAnimated) {
      setAnimationState(prev => ({ ...prev, isVisible: true }));
      
      setTimeout(() => {
        handleAnimationStart();
      }, delay);
    }
  }, [trigger, animate, delay]);

  // Handle onMount trigger
  useEffect(() => {
    if (trigger === 'onMount' && !animationState.hasAnimated) {
      setAnimationState(prev => ({ ...prev, isVisible: true }));
      
      setTimeout(() => {
        handleAnimationStart();
      }, delay);
    }
  }, [trigger, delay]);

  // Handle hover trigger
  const handleMouseEnter = () => {
    if (trigger === 'onHover' && !animationState.hasAnimated) {
      setAnimationState(prev => ({ ...prev, isVisible: true }));
      handleAnimationStart();
    }
  };

  // Build CSS classes
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

  // Set inline styles for duration and delay
  const inlineStyles = {
    '--animation-delay': `${delay}ms`,
    '--animation-duration': `${duration}ms`,
  } as React.CSSProperties;

  // Create the component with proper typing
  const ComponentElement = Component as React.ElementType;

  return (
    <ComponentElement
      ref={elementRef as any}
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