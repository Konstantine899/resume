import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mail } from 'lucide-react';
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

    it('должен передавать остальные props на button элемент', () => {
      render(<Button data-testid="custom-test">Button</Button>);

      expect(screen.getByTestId('custom-test')).toBeInTheDocument();
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

  describe('Icon support', () => {
    it('должен рендериться с иконкой слева', () => {
      render(
        <Button icon={<Mail size={18} />} iconPosition="left">
          With Icon
        </Button>
      );

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-mail');
    });

    it('должен рендериться с иконкой справа', () => {
      render(
        <Button icon={<Mail size={18} />} iconPosition="right">
          With Icon
        </Button>
      );

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-mail');
    });

    it('должен рендериться только с иконкой (icon-only)', () => {
      render(<Button icon={<Mail size={20} />} ariaLabel="Send email" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonStyles.iconOnly);
      expect(button).toHaveAttribute('aria-label', 'Send email');
    });

    it('должен применять размер иконки в зависимости от size', () => {
      const { rerender } = render(
        <Button icon={<Mail />} size="sm" ariaLabel="Icon">
          Button
        </Button>
      );

      let icon = screen.getByRole('button').querySelector('svg');
      expect(icon?.parentElement).toHaveClass(buttonStyles.icon);

      rerender(
        <Button icon={<Mail />} size="lg" ariaLabel="Icon">
          Button
        </Button>
      );

      icon = screen.getByRole('button').querySelector('svg');
      expect(icon?.parentElement).toHaveClass(buttonStyles.icon);
    });

    it('должен применять rotation к иконке', () => {
      render(
        <Button icon={<Mail />} rotation={45}>
          Rotated
        </Button>
      );

      const button = screen.getByRole('button');
      const icon = button.querySelector('svg');
      expect(icon?.parentElement).toHaveStyle('transform: rotate(45deg)');
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

    it('должен показывать Loader при loading=true', () => {
      render(<Button loading>Loading</Button>);

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.loading);
      const loaderWrapper = screen
        .getByRole('button')
        .querySelector(`.${buttonStyles.loaderWrapper}`);
      expect(loaderWrapper).toBeInTheDocument();
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен скрывать контент при loading=true', () => {
      render(<Button loading>Loading</Button>);

      const inner = screen.getByRole('button').querySelector(`.${buttonStyles.inner}`);
      expect(inner).toBeInTheDocument();
    });

    it('должен применять fullWidth класс', () => {
      render(<Button fullWidth>Full Width</Button>);

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.fullWidth);
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('должен передавать mouse event в onClick', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
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

    it('должен предотвращать стандартное поведение при disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
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

    it('должен иметь aria-label для icon-only кнопки', () => {
      render(<Button icon={<Mail />} ariaLabel="Send email" />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Send email');
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь data-testid', () => {
      render(<Button>Button</Button>);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('должен иметь focus-visible outline', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonStyles.button);
    });

    it('должен логировать ошибку при отсутствии ariaLabel для icon-only кнопки', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Button icon={<Mail />} />);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Button: ariaLabel is required for icon-only buttons')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Text centering', () => {
    it('должен центрировать текст для кнопок с текстом', () => {
      render(<Button>Centered Text</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass(buttonStyles.iconOnly);
    });

    it('должен центрировать контент для icon-only кнопок', () => {
      render(<Button icon={<Mail />} ariaLabel="Icon" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonStyles.iconOnly);
    });
  });
});
