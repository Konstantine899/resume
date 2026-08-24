// ============================================
// AnimatedSection Component
// ============================================

import { forwardRef, memo, useEffect, type CSSProperties, type ElementType } from 'react';
import { useScrollAnimation } from '@/shared/lib/hooks/useScrollAnimation';
import { classNames } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
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
export const AnimatedSection = memo(
  forwardRef<HTMLElement, AnimatedSectionProps>(
    (
      {
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
      },
      ref
    ) => {
      // Use custom hook for animation logic
      const {
        ref: hookRef,
        isVisible,
        hasAnimated,
        isAnimating,
        triggerAnimation,
        resetAnimation,
      } = useScrollAnimation({
        threshold,
        rootMargin: ANIMATION_CONSTANTS.DEFAULT_ROOT_MARGIN,
        delay,
        duration,
        triggerOnce: trigger !== 'onHover',
        disabled: trigger === 'manual' && !animate,
        onAnimationStart,
        onAnimationComplete,
      });

      // Merge forwarded ref with hook's internal ref
      const mergedRef = useMergeRefs(ref, hookRef);

      // Handle manual trigger
      useEffect(() => {
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
      } as CSSProperties;

      // Build data-state for accessibility and testing
      const dataState = isVisible ? 'visible' : hasAnimated ? 'animated' : 'hidden';

      const ComponentElement = Component as ElementType;

      return (
        <ComponentElement
          ref={mergedRef}
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
  )
);

AnimatedSection.displayName = 'AnimatedSection';
