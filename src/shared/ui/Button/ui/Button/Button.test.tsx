import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import buttonStyles from './Button.module.scss';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(<Button className="custom-class">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('должен иметь type="button" по умолчанию', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('должен принимать кастомный type', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<Button variant={variant}>Button</Button>);

        expect(screen.getByRole('button')).toHaveClass(buttonStyles[variant]);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<Button size={size}>Button</Button>);

        expect(screen.getByRole('button')).toHaveClass(buttonStyles[size]);
      });
    });
  });

  describe('States', () => {
    it('должен быть disabled при disabled=true', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен быть disabled при loading=true', () => {
      render(<Button loading>Loading</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь aria-busy при loading=true', () => {
      render(<Button loading>Loading</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять fullWidth класс', () => {
      render(<Button fullWidth>Full Width</Button>);

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.fullWidth);
    });
  });

  describe('Loading variants', () => {
    it('должен показывать spinner при loadingVariant="spinner"', () => {
      render(
        <Button loading loadingVariant="spinner">
          Loading
        </Button>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен показывать skeleton при loadingVariant="skeleton"', () => {
      render(
        <Button loading loadingVariant="skeleton">
          Loading
        </Button>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.loading);
    });

    it('должен скрывать контент при loading=true', () => {
      render(<Button loading>Loading</Button>);

      const content = screen.getByRole('button').querySelector(`.${buttonStyles.content}`);
      expect(content).toHaveClass(buttonStyles.hidden);
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled=true', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading=true', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="button"', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь data-testid', () => {
      render(<Button>Button</Button>);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });
});
