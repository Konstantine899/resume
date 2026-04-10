// ============================================
// AnimatedSection Component - TypeScript Types
// ============================================

import { ReactNode } from 'react';

/**
 * Animation types
 */
export type AnimationType =
  | 'fadeIn' // Simple fade in
  | 'fadeUp' // Fade in from bottom
  | 'fadeDown' // Fade in from top
  | 'slideInLeft' // Slide in from left
  | 'slideInRight' // Slide in from right
  | 'scaleIn' // Scale in from small
  | 'none'; // No animation

/**
 * Animation trigger types
 */
export type AnimationTrigger =
  | 'onMount' // Animate when component mounts
  | 'onScroll' // Animate when scrolled into view
  | 'onHover' // Animate on hover
  | 'manual'; // Manual control via props

/**
 * AnimatedSection props interface
 */
export interface AnimatedSectionProps {
  /**
   * Content to animate
   */
  children: ReactNode;

  /**
   * Animation type
   * @default 'fadeUp'
   */
  animation?: AnimationType;

  /**
   * Animation trigger
   * @default 'onScroll'
   */
  trigger?: AnimationTrigger;

  /**
   * Animation delay in milliseconds
   * @default 0
   */
  delay?: number;

  /**
   * Animation duration in milliseconds
   * @default 700
   */
  duration?: number;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Threshold for scroll trigger (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Manual control - force animation
   */
  animate?: boolean;

  /**
   * Callback when animation starts
   */
  onAnimationStart?: () => void;

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;

  /**
   * HTML element type
   * @default 'div'
   */
  as?: keyof React.JSX.IntrinsicElements;

  /**
   * HTML attributes
   */
  [key: string]: any;
}

/**
 * Animation state
 */
export interface AnimationState {
  isVisible: boolean;
  hasAnimated: boolean;
  isAnimating: boolean;
}

/**
 * Intersection observer options
 */
export interface IntersectionOptions {
  threshold: number;
  rootMargin: string;
}
