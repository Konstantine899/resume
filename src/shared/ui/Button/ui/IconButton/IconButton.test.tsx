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
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<IconButton icon={<Mail />} ariaLabel="Icon" variant={variant} />);

        expect(screen.getByRole('button')).toHaveClass(iconButtonStyles[variant]);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<IconButton icon={<Mail />} ariaLabel="Icon" size={size} />);

        expect(screen.getByRole('button')).toHaveClass(iconButtonStyles[size]);
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

      expect(screen.getByRole('button')).toHaveClass(iconButtonStyles.loading);
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
});
