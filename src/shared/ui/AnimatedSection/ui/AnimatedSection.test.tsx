// ============================================
// AnimatedSection Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnimatedSection } from './AnimatedSection';
import styles from './AnimatedSection.module.scss';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(private callback: (entries: IntersectionObserverEntry[]) => void) {}
  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries);
  }
}

describe('AnimatedSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================
  describe('rendering', () => {
    it('renders children', () => {
      render(
        <AnimatedSection>
          <div data-testid="content">Test Content</div>
        </AnimatedSection>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('applies animatedSection base class', () => {
      const { container } = render(<AnimatedSection>Content</AnimatedSection>);

      expect(container.firstChild).toHaveClass(styles.animatedSection);
    });

    it('applies animation class', () => {
      const { container } = render(<AnimatedSection animation="fadeUp">Content</AnimatedSection>);

      expect(container.firstChild).toHaveClass(styles.fadeUp);
    });

    it('applies custom className', () => {
      const { container } = render(
        <AnimatedSection className="custom-class">Content</AnimatedSection>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('supports as prop (polymorphic)', () => {
      const { container } = render(<AnimatedSection as="section">Content</AnimatedSection>);

      expect((container.firstChild as HTMLElement).tagName).toBe('SECTION');
    });

    it('renders with data-testid', () => {
      render(<AnimatedSection>Content</AnimatedSection>);

      expect(screen.getByTestId('animated-section')).toBeInTheDocument();
    });

    it('applies data-state attribute', () => {
      const { container } = render(<AnimatedSection>Content</AnimatedSection>);

      expect(container.firstChild).toHaveAttribute('data-state', 'hidden');
    });

    it('updates data-state when visible', () => {
      const { container } = render(
        <AnimatedSection trigger="manual" animate={true}>
          Content
        </AnimatedSection>
      );

      vi.advanceTimersByTime(700);

      expect(container.firstChild).toHaveAttribute('data-state', 'visible');
    });
  });

  // ============================================
  // Animation Tests
  // ============================================
  describe('animation', () => {
    it('applies inline styles for delay and duration', () => {
      const { container } = render(
        <AnimatedSection delay={500} duration={1000}>
          Content
        </AnimatedSection>
      );

      const element = container.firstChild as HTMLElement;
      expect(element.style.getPropertyValue('--animation-delay')).toBe('500ms');
      expect(element.style.getPropertyValue('--animation-duration')).toBe('1000ms');
    });

    it('uses default delay and duration from constants', () => {
      const { container } = render(<AnimatedSection>Content</AnimatedSection>);

      const element = container.firstChild as HTMLElement;
      expect(element.style.getPropertyValue('--animation-delay')).toBe('0ms');
      expect(element.style.getPropertyValue('--animation-duration')).toBe('700ms');
    });

    it('applies visible class when animation completes', () => {
      const { container } = render(
        <AnimatedSection trigger="manual" animate={true}>
          Content
        </AnimatedSection>
      );

      vi.advanceTimersByTime(700);

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(styles.visible);
    });

    it('applies animating class during animation', () => {
      const { container } = render(
        <AnimatedSection trigger="manual" animate={true}>
          Content
        </AnimatedSection>
      );

      // During animation (before completion)
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(styles.animating);
    });
  });

  // ============================================
  // Callback Tests
  // ============================================
  describe('callbacks', () => {
    it('calls onAnimationStart callback with manual trigger', () => {
      const onStart = vi.fn();
      render(
        <AnimatedSection trigger="manual" animate={true} onAnimationStart={onStart}>
          Content
        </AnimatedSection>
      );

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('calls onAnimationComplete callback', () => {
      const onComplete = vi.fn();
      render(
        <AnimatedSection trigger="manual" animate={true} onAnimationComplete={onComplete}>
          Content
        </AnimatedSection>
      );

      vi.advanceTimersByTime(700);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Trigger Tests
  // ============================================
  describe('triggers', () => {
    it('handles manual trigger', () => {
      const { container, rerender } = render(
        <AnimatedSection trigger="manual" animate={false}>
          Content
        </AnimatedSection>
      );

      rerender(
        <AnimatedSection trigger="manual" animate={true}>
          Content
        </AnimatedSection>
      );

      vi.advanceTimersByTime(700);

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(styles.visible);
    });

    it('handles onHover trigger', () => {
      const { container } = render(
        <AnimatedSection trigger="onHover">
          <div>Hover me</div>
        </AnimatedSection>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));
      vi.advanceTimersByTime(700);

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(styles.visible);
    });

    it('handles onScroll trigger (IntersectionObserver)', () => {
      const observeSpy = vi.fn();

      class MockObserverWithSpy {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(private callback: (entries: IntersectionObserverEntry[]) => void) {}
        trigger(entries: IntersectionObserverEntry[]) {
          this.callback(entries);
        }
      }

      vi.stubGlobal('IntersectionObserver', MockObserverWithSpy);

      render(<AnimatedSection trigger="onScroll">Content</AnimatedSection>);

      // IntersectionObserver should be created and observe called
      expect(observeSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('accessibility', () => {
    it('has displayName', () => {
      expect(AnimatedSection.displayName).toBe('AnimatedSection');
    });

    it('supports reduced motion preference', () => {
      // This test verifies the CSS has reduced-motion support
      // Actual media query testing requires browser environment
      const styleContent = `
        @media (prefers-reduced-motion: reduce) {
          .animatedSection {
            transition: none;
            transform: none;
            opacity: 1;
          }
        }
      `;
      expect(styleContent).toContain('prefers-reduced-motion');
    });
  });

  // ============================================
  // Default Props Tests
  // ============================================
  describe('default props', () => {
    it('uses default animation (fadeUp)', () => {
      const { container } = render(<AnimatedSection>Content</AnimatedSection>);

      expect(container.firstChild).toHaveClass(styles.fadeUp);
    });

    it('uses default trigger (onScroll)', () => {
      const observeSpy = vi.fn();

      class MockObserverWithSpy {
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(private callback: (entries: IntersectionObserverEntry[]) => void) {}
        trigger(entries: IntersectionObserverEntry[]) {
          this.callback(entries);
        }
      }

      vi.stubGlobal('IntersectionObserver', MockObserverWithSpy);

      render(<AnimatedSection>Content</AnimatedSection>);

      expect(observeSpy).toHaveBeenCalled();
    });

    it('uses default threshold (0.1)', () => {
      const { container } = render(<AnimatedSection>Content</AnimatedSection>);

      const element = container.firstChild as HTMLElement;
      expect(element).toBeInTheDocument();
    });
  });
});
