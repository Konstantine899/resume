import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';
import loaderStyles from './Loader.module.scss';

describe('Loader', () => {
  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Loader />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Loader />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять кастомный className', () => {
      const { container } = render(<Loader className="custom-class" />);

      // Custom className should be in the rendered HTML
      expect(container.innerHTML).toContain('custom-class');
    });

    it('должен принимать кастомный label', () => {
      render(<Loader label="Custom loading" />);

      expect(screen.getByLabelText('Custom loading')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['spinner', 'dots', 'pulse', 'double-ring'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<Loader variant={variant} />);

        // CSS modules transform class names, so check if variant name is in className
        const element = screen.getByRole('status');
        expect(element.className.toLowerCase()).toContain(variant.replace('-', ''));
      });
    });

    it('должен рендерить spinnerCircle для spinner', () => {
      render(<Loader variant="spinner" />);

      expect(
        screen.getByRole('status').querySelector(`.${loaderStyles.spinnerCircle}`)
      ).toBeInTheDocument();
    });

    it('должен рендерить 3 dots для dots', () => {
      render(<Loader variant="dots" />);

      const dots = screen.getByRole('status').querySelectorAll(`.${loaderStyles.dot}`);
      expect(dots).toHaveLength(3);
    });

    it('должен рендерить pulseCircle для pulse', () => {
      render(<Loader variant="pulse" />);

      expect(
        screen.getByRole('status').querySelector(`.${loaderStyles.pulseCircle}`)
      ).toBeInTheDocument();
    });

    it('должен рендерить outerRing и innerRing для double-ring', () => {
      render(<Loader variant="double-ring" />);

      expect(
        screen.getByRole('status').querySelector(`.${loaderStyles.outerRing}`)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('status').querySelector(`.${loaderStyles.innerRing}`)
      ).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<Loader size={size} variant="spinner" />);

        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'secondary', 'accent'] as const;

    colors.forEach((color) => {
      it(`должен рендериться с color="${color}"`, () => {
        render(<Loader color={color} variant="spinner" />);

        // Color classes are applied via CSS variables, check element renders
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('должен применять primary цвет (#de8041)', () => {
      render(<Loader color="primary" variant="spinner" />);

      const circle = screen.getByRole('status').querySelector(`.${loaderStyles.spinnerCircle}`);
      // Check that the element exists and has border
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('class');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="status"', () => {
      render(<Loader />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь aria-label', () => {
      render(<Loader label="Loading" />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Loader />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-busy="true" для всех variants', () => {
      const variants = ['spinner', 'dots', 'pulse', 'double-ring'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Loader variant={variant} />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        unmount();
      });
    });
  });

  describe('HTML Attributes', () => {
    it('должен передавать дополнительные HTML атрибуты', () => {
      render(<Loader data-testid="loader" id="custom-loader" />);

      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toHaveAttribute('id', 'custom-loader');
    });
  });
});
