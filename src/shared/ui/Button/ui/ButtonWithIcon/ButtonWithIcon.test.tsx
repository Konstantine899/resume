import { fireEvent, render, screen } from '@testing-library/react';
import { ArrowRight, Mail } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  describe('Icon size inference', () => {
    it('должен устанавливать размер leftIcon для size="sm"', () => {
      const { container } = render(
        <ButtonWithIcon leftIcon={<Mail />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('должен сохранять ручной размер leftIcon при override', () => {
      const { container } = render(
        <ButtonWithIcon leftIcon={<Mail size={32} />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
    });

    it('должен устанавливать размер rightIcon для size="sm"', () => {
      const { container } = render(
        <ButtonWithIcon rightIcon={<Mail />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('должен сохранять ручной размер rightIcon при override', () => {
      const { container } = render(
        <ButtonWithIcon rightIcon={<Mail size={28} />} size="lg">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '28');
    });
  });

  describe('Polymorphic (component prop)', () => {
    it('должен рендериться как <a> при component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/about" leftIcon={<Mail />}>
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('должен сохранять стили при component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/test" leftIcon={<Mail />} variant="danger">
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toHaveClass(buttonWithIconStyles.button);
      expect(link).toHaveClass(buttonWithIconStyles.danger);
    });

    it('должен иметь aria-disabled при disabled=true и component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/test" leftIcon={<Mail />} disabled>
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен рендериться как <div> при component="div"', () => {
      render(
        <ButtonWithIcon component="div" leftIcon={<Mail />}>
          Div Button
        </ButtonWithIcon>
      );

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-disabled при disabled=true и component="div"', () => {
      render(
        <ButtonWithIcon component="div" leftIcon={<Mail />} disabled>
          Div Button
        </ButtonWithIcon>
      );

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при loading=true и component="a"', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon
          component="a"
          href="/test"
          leftIcon={<Mail />}
          loading
          onClick={handleClick}
        >
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      fireEvent.click(link);

      expect(handleClick).not.toHaveBeenCalled();
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен передавать ref на anchor элемент при component="a"', () => {
      const ref = vi.fn();
      render(
        <ButtonWithIcon component="a" href="/about" leftIcon={<Mail />} ref={ref}>
          Link
        </ButtonWithIcon>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });
});
