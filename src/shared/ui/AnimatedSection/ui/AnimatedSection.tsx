// ============================================
// AnimatedSection Component
// ============================================

import React, { memo } from 'react';
import { useScrollAnimation } from '@/shared/lib/hooks/useScrollAnimation';
import { classNames } from '@/shared/lib/utils/classNames';
import type { AnimatedSectionProps } from '../model/types';
import { ANIMATION_CONSTANTS } from '../model/constants';
import styles from './AnimatedSection.module.scss';

/**
 * AnimatedSection Component — scroll-triggered animations
 *
 * @example
 * // Basic usage with default fadeUp animation
 * ```tsx
 * <AnimatedSection>
 *   <h2>Content fades in on scroll</h2>
 * </AnimatedSection>
 * ```
 *
 * @example
 * // Custom animation and timing
 * ```tsx
 * <AnimatedSection
 *   animation="scaleIn"
 *   trigger="onScroll"
 *   delay={200}
 *   duration={1000}
 *   threshold={0.2}
 * >
 *   <p>Scales in with 200ms delay</p>
 * </AnimatedSection>
 * ```
 *
 * @example
 * // Manual trigger (for controlled animations)
 * ```tsx
 * const [animate, setAnimate] = useState(false);
 * <AnimatedSection trigger="manual" animate={animate}>
 *   <button onClick={() => setAnimate(true)}>Animate</button>
 * </AnimatedSection>
 * ```
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = memo(
  ({
    children,
    animation = 'fadeUp',
    trigger = 'onScroll',
    delay = ANIMATION_CONSTANTS.DEFAULT_DELAY,
    duration = ANIMATION_CONSTANTS.DEFAULT_DURATION,
    className = '',
    threshold = ANIMATION_CONSTANTS.DEFAULT_THRESHOLD,
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
        rootMargin: ANIMATION_CONSTANTS.DEFAULT_ROOT_MARGIN,
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

    // Build data-state for accessibility and testing
    const dataState = isVisible ? 'visible' : hasAnimated ? 'animated' : 'hidden';

    const ComponentElement = Component as React.ElementType;

    return (
      <ComponentElement
        ref={ref as React.Ref<HTMLElement>}
        className={animationClasses}
        style={inlineStyles}
        onMouseEnter={trigger === 'onHover' ? triggerAnimation : undefined}
        data-testid="animated-section"
        data-state={dataState}
        {...props}
      >
        {children}
      </ComponentElement>
    );
  }
);

AnimatedSection.displayName = 'AnimatedSection';

export default AnimatedSection;
