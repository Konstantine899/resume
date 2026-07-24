import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import styles from './Spinner.module.scss';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/Loading|Загрузка/i)).toBeInTheDocument();
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять кастомный className', () => {
      const { container } = render(<Spinner className="custom-class" />);

      expect(container.innerHTML).toContain('custom-class');
    });

    it('должен принимать кастомный label', () => {
      render(<Spinner label="Custom loading" />);

      expect(screen.getByLabelText('Custom loading')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['spinner', 'double-ring'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<Spinner variant={variant} />);

        const element = screen.getByRole('status');
        expect(element).toBeInTheDocument();
      });
    });

    it('должен рендерить spinnerCircle для spinner', () => {
      render(<Spinner variant="spinner" />);

      const circle = screen.getByRole('status').querySelector(`.${styles.spinnerCircle}`);
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveClass(styles.spinnerCircle);
    });

    it('должен рендерить outerRing и innerRing для double-ring', () => {
      render(<Spinner variant="double-ring" />);

      expect(screen.getByRole('status').querySelector(`.${styles.outerRing}`)).toBeInTheDocument();
      expect(screen.getByRole('status').querySelector(`.${styles.innerRing}`)).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<Spinner size={size} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'secondary', 'accent', 'orange'] as const;

    colors.forEach((color) => {
      it(`должен рендериться с color="${color}"`, () => {
        render(<Spinner color={color} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Speed', () => {
    const speeds = ['slow', 'normal', 'fast'] as const;

    speeds.forEach((speed) => {
      it(`должен устанавливать --spinner-speed для speed="${speed}"`, () => {
        const { container } = render(<Spinner speed={speed} />);
        const root = container.firstChild as HTMLElement;

        expect(root.style.getPropertyValue('--spinner-speed')).toBeTruthy();
      });
    });

    it('должен устанавливать --double-ring-speed-outer для double-ring + speed', () => {
      const { container } = render(<Spinner variant="double-ring" speed="slow" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--double-ring-speed-outer')).toBe('1.5s');
      expect(root.style.getPropertyValue('--double-ring-speed-inner')).toBe('1.3s');
    });

    it('не должен устанавливать speed vars если speed не передан', () => {
      const { container } = render(<Spinner />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-speed')).toBe('');
    });
  });

  describe('Thickness', () => {
    const thicknesses = ['thin', 'normal', 'thick'] as const;

    thicknesses.forEach((thickness) => {
      it(`должен устанавливать --spinner-thickness для thickness="${thickness}"`, () => {
        const { container } = render(<Spinner thickness={thickness} />);
        const root = container.firstChild as HTMLElement;

        expect(root.style.getPropertyValue('--spinner-thickness')).toBeTruthy();
      });
    });

    it('должен устанавливать --double-ring-thickness для double-ring + thickness', () => {
      const { container } = render(<Spinner variant="double-ring" thickness="thick" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--double-ring-thickness')).toBe('5px');
    });
  });

  describe('Track Color', () => {
    it('должен устанавливать --spinner-track', () => {
      const { container } = render(<Spinner trackColor="#ff0000" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-track')).toBe('#ff0000');
    });

    it('должен устанавливать --spinner-track для double-ring', () => {
      const { container } = render(<Spinner variant="double-ring" trackColor="#00ff00" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-track')).toBe('#00ff00');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="status"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь aria-label', () => {
      render(<Spinner label="Loading" />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-busy="true" для всех variants', () => {
      const variants = ['spinner', 'double-ring'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Spinner variant={variant} />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        unmount();
      });
    });
  });

  describe('HTML Attributes', () => {
    it('должен передавать дополнительные HTML атрибуты', () => {
      render(<Spinner data-testid="spinner" id="custom-spinner" />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toHaveAttribute('id', 'custom-spinner');
    });
  });
});
