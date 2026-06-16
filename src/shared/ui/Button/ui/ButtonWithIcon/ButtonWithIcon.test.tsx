import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mail, ArrowRight } from 'lucide-react';
import { ButtonWithIcon } from './ButtonWithIcon';
import buttonWithIconStyles from './ButtonWithIcon.module.scss';

describe('ButtonWithIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с текстом', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Click me</ButtonWithIcon>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('должен рендериться с leftIcon', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>With Icon</ButtonWithIcon>);

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('With Icon'));
    });

    it('должен рендериться с rightIcon', () => {
      render(<ButtonWithIcon rightIcon={<ArrowRight />}>Next</ButtonWithIcon>);

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('Next'));
    });

    it('должен рендериться с обеими иконками', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} rightIcon={<ArrowRight />}>
          Both
        </ButtonWithIcon>
      );

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('Both'));
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(
          <ButtonWithIcon leftIcon={<Mail />} variant={variant}>
            Button
          </ButtonWithIcon>
        );

        expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles[variant]);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(
          <ButtonWithIcon leftIcon={<Mail />} size={size}>
            Button
          </ButtonWithIcon>
        );

        expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles[size]);
      });
    });
  });

  describe('States', () => {
    it('должен быть disabled при disabled=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled>
          Disabled
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен быть disabled при loading=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь aria-busy при loading=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять fullWidth класс', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} fullWidth>
          Full Width
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles.fullWidth);
    });
  });

  describe('Loading variants', () => {
    it('должен показывать spinner при loadingVariant="spinner"', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading loadingVariant="spinner">
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен показывать skeleton при loadingVariant="skeleton"', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading loadingVariant="skeleton">
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles.loading);
    });

    it('должен скрывать контент при loading=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      const content = screen.getByRole('button').querySelector(`.${buttonWithIconStyles.content}`);
      expect(content).toHaveClass(buttonWithIconStyles.hidden);
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} onClick={handleClick}>
          Click me
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled onClick={handleClick}>
          Disabled
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading onClick={handleClick}>
          Loading
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="button"', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Button</ButtonWithIcon>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled>
          Disabled
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь data-testid', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Button</ButtonWithIcon>);

      expect(screen.getByTestId('button-with-icon')).toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} ref={ref}>
          Button
        </ButtonWithIcon>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });
});
