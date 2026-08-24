import { fireEvent, render, screen } from '@testing-library/react';
import { Mail } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';
import iconButtonStyles from './IconButton.module.scss';

describe('IconButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с иконкой', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByLabelText('Icon')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" className="custom-class" />);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<IconButton icon={<Mail />} ariaLabel="Icon" variant={variant} />);

        expect(screen.getByRole('button')).toHaveClass(iconButtonStyles[variant] ?? '');
      });
    });

    it('variant="danger" маппится в primary + colorSchemeDanger', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Delete" variant="danger" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(iconButtonStyles.primary ?? '');
      expect(button).toHaveClass(iconButtonStyles['color-scheme-danger'] ?? '');
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<IconButton icon={<Mail />} ariaLabel="Icon" size={size} />);

        expect(screen.getByRole('button')).toHaveClass(iconButtonStyles[size] ?? '');
      });
    });
  });

  describe('Accessibility', () => {
    it('должен иметь aria-label', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Send email" />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Send email');
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" disabled />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь aria-busy при loading', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" loading />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('States', () => {
    it('должен быть disabled при disabled=true', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" disabled />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('должен быть disabled при loading=true', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" loading />);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Loading variants', () => {
    it('должен показывать spinner при loadingVariant="spinner"', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" loading loadingVariant="spinner" />);

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен показывать skeleton при loadingVariant="skeleton"', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Icon" loading loadingVariant="skeleton" />);

      expect(screen.getByRole('button')).toHaveClass(iconButtonStyles.loading ?? '');
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<Mail />} ariaLabel="Icon" onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<Mail />} ariaLabel="Icon" disabled onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading', () => {
      const handleClick = vi.fn();
      render(<IconButton icon={<Mail />} ariaLabel="Icon" loading onClick={handleClick} />);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(<IconButton icon={<Mail />} ariaLabel="Icon" ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Polymorphic (component prop)', () => {
    it('должен рендериться как <a> при component="a"', () => {
      render(<IconButton component="a" href="/about" icon={<Mail />} ariaLabel="Mail" />);

      const link = screen.getByTestId('icon-button');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('должен иметь aria-label при component="a"', () => {
      render(<IconButton component="a" href="/about" icon={<Mail />} ariaLabel="Send email" />);

      const link = screen.getByTestId('icon-button');
      expect(link).toHaveAttribute('aria-label', 'Send email');
    });

    it('должен сохранять стили при component="a"', () => {
      render(
        <IconButton component="a" href="/test" icon={<Mail />} ariaLabel="Mail" variant="ghost" />
      );

      const link = screen.getByTestId('icon-button');
      expect(link).toHaveClass(iconButtonStyles.button ?? '');
      expect(link).toHaveClass(iconButtonStyles.ghost ?? '');
    });

    it('должен иметь aria-disabled при disabled=true и component="a"', () => {
      render(<IconButton component="a" href="/test" icon={<Mail />} ariaLabel="Mail" disabled />);

      const link = screen.getByTestId('icon-button');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен рендериться как <div> при component="div"', () => {
      render(<IconButton component="div" icon={<Mail />} ariaLabel="Mail" />);

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-disabled при disabled=true и component="div"', () => {
      render(<IconButton component="div" icon={<Mail />} ariaLabel="Mail" disabled />);

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при loading=true и component="a"', () => {
      const handleClick = vi.fn();
      render(
        <IconButton
          component="a"
          href="/test"
          icon={<Mail />}
          ariaLabel="Mail"
          loading
          onClick={handleClick}
        />
      );

      const link = screen.getByTestId('icon-button');
      fireEvent.click(link);

      expect(handleClick).not.toHaveBeenCalled();
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен передавать ref на anchor элемент при component="a"', () => {
      const ref = vi.fn();
      render(<IconButton component="a" href="/about" icon={<Mail />} ariaLabel="Mail" ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });

  describe('Icon size inference', () => {
    it('должен устанавливать размер иконки 12 для size="xs"', () => {
      const { container } = render(<IconButton icon={<Mail />} ariaLabel="Mail" size="xs" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
    });

    it('должен устанавливать размер иконки 16 для size="sm"', () => {
      const { container } = render(<IconButton icon={<Mail />} ariaLabel="Mail" size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('должен устанавливать размер иконки 20 для size="md" (по умолчанию)', () => {
      const { container } = render(<IconButton icon={<Mail />} ariaLabel="Mail" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
    });

    it('должен устанавливать размер иконки 24 для size="lg"', () => {
      const { container } = render(<IconButton icon={<Mail />} ariaLabel="Mail" size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
    });

    it('должен устанавливать размер иконки 28 для size="xl"', () => {
      const { container } = render(<IconButton icon={<Mail />} ariaLabel="Mail" size="xl" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '28');
    });

    it('должен сохранять ручной размер иконки при override', () => {
      const { container } = render(
        <IconButton icon={<Mail size={32} />} ariaLabel="Mail" size="sm" />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
    });
  });

  describe('colorScheme', () => {
    it('должен рендериться с colorScheme="danger"', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Delete" colorScheme="danger" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(iconButtonStyles['color-scheme-danger'] ?? '');
    });

    it('variant="danger" должен давать colorSchemeDanger класс', () => {
      render(<IconButton icon={<Mail />} ariaLabel="Delete" variant="danger" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(iconButtonStyles['color-scheme-danger'] ?? '');
    });
  });
});
