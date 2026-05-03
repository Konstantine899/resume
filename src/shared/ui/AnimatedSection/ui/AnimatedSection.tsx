import React, { useEffect, useRef, useState } from 'react';
import type { AnimatedSectionProps, AnimationState } from '../model/types';
import styles from './AnimatedSection.module.scss';

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
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Используем refs для актуальных значений без ре-рендеров
  const hasAnimatedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const animateRef = useRef(animate);

  // Синхронизируем refs с props
  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  // Обновляем refs при изменении состояния
  useEffect(() => {
    hasAnimatedRef.current = animationState.hasAnimated;
    isAnimatingRef.current = animationState.isAnimating;
  }, [animationState.hasAnimated, animationState.isAnimating]);

  // Очищаем все таймеры
  const clearAllTimeouts = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  };

  // Handle animation start
  const handleAnimationStart = () => {
    if (isAnimatingRef.current) return;

    setAnimationState((prev) => ({ ...prev, isAnimating: true }));
    onAnimationStart?.();

    clearAllTimeouts();

    completionTimeoutRef.current = setTimeout(() => {
      setAnimationState((prev) => ({
        ...prev,
        isAnimating: false,
        hasAnimated: true,
      }));
      onAnimationComplete?.();
    }, duration);
  };

  // Запуск анимации с задержкой
  const startAnimationWithDelay = () => {
    if (hasAnimatedRef.current) return;

    setAnimationState((prev) => ({ ...prev, isVisible: true }));

    animationTimeoutRef.current = setTimeout(() => {
      handleAnimationStart();
    }, delay);
  };

  // Handle intersection observer callback
  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (entry.isIntersecting && !hasAnimatedRef.current) {
      startAnimationWithDelay();

      // Отключаем observer после первой анимации
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
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
      clearAllTimeouts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, threshold]);

  // Handle manual animation trigger
  useEffect(() => {
    if (trigger === 'manual' && animateRef.current && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }
  }, [trigger, delay, animate]);

  // Handle onMount trigger - только при маунте
  useEffect(() => {
    if (trigger === 'onMount' && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }

    return () => {
      clearAllTimeouts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, delay]);

  // Handle hover trigger
  const handleMouseEnter = () => {
    if (trigger === 'onHover' && !hasAnimatedRef.current) {
      startAnimationWithDelay();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
