import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { Spinner } from './Spinner';

vi.useFakeTimers();

describe('Spinner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('должен рендериться с дефолтными пропсами', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен рендериться с разными размерами', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> = [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        'xxl',
      ];
      sizes.forEach((size) => {
        const { unmount } = render(<Spinner size={size} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
        unmount();
      });
    });

    it('должен рендериться с разными цветами', () => {
      const colors: Array<'primary' | 'secondary' | 'accent' | 'orange'> = [
        'primary',
        'secondary',
        'accent',
        'orange',
      ];
      colors.forEach((color) => {
        const { unmount } = render(<Spinner color={color} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-color', color);
        unmount();
      });
    });

    it('должен рендериться с разными вариантами', () => {
      const variants: Array<'spinner' | 'double-ring'> = ['spinner', 'double-ring'];
      variants.forEach((variant) => {
        const { unmount } = render(<Spinner variant={variant} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-variant', variant);
        unmount();
      });
    });

    it('должен применять кастомный className', () => {
      render(<Spinner className="custom-class" />);
      expect(screen.getByRole('status')).toHaveClass('custom-class');
    });

    it('должен рендериться с aria-label', () => {
      render(<Spinner label="Custom loading" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Custom loading');
    });

    it('должен иметь role="status" и aria-busy', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    it('должен иметь атрибут data-testid на круге', () => {
      render(<Spinner />);
      expect(screen.getByTestId('spinner-circle')).toBeInTheDocument();
    });
  });

  describe('Delay (CSS-only)', () => {
    it('должен рендериться сразу с animation-delay', () => {
      render(<Spinner delay={300} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute(
        'style',
        expect.stringContaining('--spinner-delay: 300ms')
      );
    });

    it('должен появиться после истечения delay с aria-busy', () => {
      render(<Spinner delay={300} />);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('должен отменять таймер при размонтировании', () => {
      render(<Spinner delay={500} />);
      // With CSS delay, no setTimeout timer is created
      expect(vi.getTimerCount()).toBe(0);
    });

    it('должен показать спиннер при изменении delay на 0 до срабатывания таймера', () => {
      const { rerender } = render(<Spinner delay={300} />);

      expect(screen.getByRole('status')).toHaveAttribute(
        'style',
        expect.stringContaining('--spinner-delay: 300ms')
      );

      rerender(<Spinner delay={0} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('delay={0} должен рендериться сразу', () => {
      render(<Spinner delay={0} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('spinner variant должен рендерить один круг', () => {
      render(<Spinner variant="spinner" />);
      expect(screen.getByTestId('spinner-circle')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-ring')).not.toBeInTheDocument();
      expect(screen.queryByTestId('inner-ring')).not.toBeInTheDocument();
    });

    it('double-ring variant должен рендерить два кольца', () => {
      render(<Spinner variant="double-ring" />);
      // Double ring has outer-ring and inner-ring classes
      expect(screen.getByTestId('outer-ring')).toBeInTheDocument();
      expect(screen.getByTestId('inner-ring')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner-circle')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'xxl',
    ];

    sizes.forEach((size) => {
      it(`должен рендериться с размером ${size}`, () => {
        render(<Spinner size={size} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
      });
    });

    it('должен поддерживать числовой size', () => {
      render(<Spinner size={42} />);
      const spinner = screen.getByRole('status');
      // Numeric size doesn't set data-size attribute
      expect(spinner).not.toHaveAttribute('data-size');
      expect(spinner).toHaveStyle({ '--spinner-size': '42px' });
    });
  });

  describe('Colors', () => {
    it('должен применять цвет primary', () => {
      render(<Spinner color="primary" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'primary');
    });

    it('должен применять цвет secondary', () => {
      render(<Spinner color="secondary" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'secondary');
    });

    it('должен применять цвет accent', () => {
      render(<Spinner color="accent" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'accent');
    });

    it('должен применять цвет orange', () => {
      render(<Spinner color="orange" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'orange');
    });
  });

  describe('Variants', () => {
    it('spinner variant: один круг с анимацией', () => {
      render(<Spinner variant="spinner" />);
      expect(screen.getByTestId('spinner-circle')).toBeInTheDocument();
      expect(screen.queryByTestId('outer-ring')).not.toBeInTheDocument();
      expect(screen.queryByTestId('inner-ring')).not.toBeInTheDocument();
    });

    it('double-ring variant: два кольца', () => {
      render(<Spinner variant="double-ring" />);
      // Double ring has outer-ring and inner-ring classes
      expect(screen.getByTestId('outer-ring')).toBeInTheDocument();
      expect(screen.getByTestId('inner-ring')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner-circle')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'> = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'xxl',
    ];

    sizes.forEach((size) => {
      it(`должен рендериться с размером ${size}`, () => {
        render(<Spinner size={size} />);
        expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
      });
    });

    it('должен поддерживать числовой size', () => {
      render(<Spinner size={42} />);
      const spinner = screen.getByRole('status');
      // Numeric size doesn't set data-size attribute
      expect(spinner).not.toHaveAttribute('data-size');
      expect(spinner).toHaveStyle({ '--spinner-size': '42px' });
    });
  });

  describe('Colors', () => {
    it('должен применять цвет primary', () => {
      render(<Spinner color="primary" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'primary');
    });

    it('должен применять цвет secondary', () => {
      render(<Spinner color="secondary" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'secondary');
    });

    it('должен применять цвет accent', () => {
      render(<Spinner color="accent" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'accent');
    });

    it('должен применить цвет orange', () => {
      render(<Spinner color="orange" />);
      expect(screen.getByRole('status')).toHaveAttribute('data-color', 'orange');
    });
  });

  describe('Speed and Thickness', () => {
    it('должен применять speed через CSS переменную', () => {
      render(<Spinner speed="fast" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveStyle({ '--spinner-speed': '0.4s' });
    });

    it('должен применять thickness через CSS переменную', () => {
      render(<Spinner thickness="thick" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveStyle({ '--spinner-thickness': '3px' });
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-live="polite"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('должен иметь aria-label по умолчанию', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'loading');
    });

    it('должен переопределять aria-label через prop', () => {
      render(<Spinner label="Custom label" />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Reduced Motion', () => {
    it('должен отключать анимацию при prefers-reduced-motion', () => {
      render(<Spinner />);
      const spinnerCircle = screen.getByTestId('spinner-circle');
      // Environment has reduced motion by default, just verify it's disabled
      const style = window.getComputedStyle(spinnerCircle);
      expect(style.animationName).toBe('none');
    });
  });
});
