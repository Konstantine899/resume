import React, { memo } from 'react';
import { useScrollAnimation } from '@/shared/lib/hooks/useScrollAnimation';
import { classNames } from '@/shared/lib/utils/classNames';
import type { AnimatedSectionProps } from '../model/types';
import styles from './AnimatedSection.module.scss';

/**
 * AnimatedSection Component
 * Renders children with scroll-triggered animations.
 * Uses useScrollAnimation hook for animation logic.
 *
 * @param props - Component props
 * @param props.children - Child elements to render
 * @param props.animation - Animation type (fadeUp, fadeDown, fadeIn, slideInLeft, slideInRight, scaleIn, none)
 * @param props.trigger - Trigger type (onScroll, onHover, manual)
 * @param props.delay - Animation delay in milliseconds
 * @param props.duration - Animation duration in milliseconds
 * @param props.className - Additional CSS classes
 * @param props.threshold - IntersectionObserver threshold (0-1)
 * @param props.animate - Manual trigger flag (for trigger="manual")
 * @param props.onAnimationStart - Callback when animation starts
 * @param props.onAnimationComplete - Callback when animation completes
 * @param props.as - HTML element to render (default: "div")
 * @param props...rest - Additional HTML attributes
 * @returns Animated section component
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = memo(
  ({
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
    // Use custom hook for animation logic
    const { ref, isVisible, hasAnimated, isAnimating, triggerAnimation, resetAnimation } =
      useScrollAnimation({
        threshold,
        rootMargin: '0px 0px -50px 0px',
        delay,
        duration,
        triggerOnce: trigger !== 'onHover',
        disabled: trigger === 'manual' && !animate,
        onAnimationStart,
        onAnimationComplete,
      });

    // Handle manual trigger
    React.useEffect(() => {
      if (trigger === 'manual' && animate) {
        triggerAnimation();
      }
      if (trigger === 'manual' && !animate && hasAnimated) {
        resetAnimation();
      }
    }, [trigger, animate, hasAnimated, triggerAnimation, resetAnimation]);

    // Build animation classes using classNames utility
    const animationClasses = classNames(
      styles.animatedSection,
      styles[animation],
      isVisible && styles.visible,
      isAnimating && styles.animating,
      hasAnimated && styles.animated,
      className
    );

    // Inline styles for CSS variables
    const inlineStyles = {
      '--animation-delay': `${delay}ms`,
      '--animation-duration': `${duration}ms`,
    } as React.CSSProperties;

    const ComponentElement = Component as React.ElementType;

    return (
      <ComponentElement
        ref={ref as React.Ref<HTMLElement>}
        className={animationClasses}
        style={inlineStyles}
        onMouseEnter={trigger === 'onHover' ? triggerAnimation : undefined}
        data-testid="animated-section"
        {...props}
      >
        {children}
      </ComponentElement>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';

export default AnimatedSection;
