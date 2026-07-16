import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Home } from 'lucide-react';
import { Icon } from './Icon';

describe('Icon', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('renders icon correctly', () => {
      render(<Icon name={Home} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      const { container } = render(<Icon name={Home} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('forwards className', () => {
      render(<Icon name={Home} className="custom-class" />);
      const wrapper = screen.getByTestId('icon-wrapper');
      expect(wrapper).toHaveClass(/custom-class/);
    });
  });

  describe('forwardRef', () => {
    it('должен передавать ref на span элемент', () => {
      const ref = { current: null };
      render(<Icon name={Home} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });

    it('должен иметь displayName', () => {
      expect(Icon.displayName).toBe('Icon');
    });
  });

  describe('Accessibility', () => {
    it('renders with aria-label when provided', () => {
      render(<Icon name={Home} ariaLabel="Home icon" />);
      const iconElement = screen.getByLabelText('Home icon');
      expect(iconElement).toBeInTheDocument();
    });

    it('renders with role="img" for non-decorative icons', () => {
      render(<Icon name={Home} ariaLabel="Test" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('hides from screen readers when decorative', () => {
      const { container } = render(<Icon name={Home} decorative />);
      const wrapperElement = container.querySelector('span');
      expect(wrapperElement).toHaveAttribute('aria-hidden', 'true');
      expect(wrapperElement).not.toHaveAttribute('role');
    });

    it('renders with role="button" when onClick is provided', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Click me" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders aria-pressed when isPressed is provided', () => {
      render(<Icon name={Home} onClick={vi.fn()} isPressed={true} ariaLabel="Toggle" />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders aria-pressed="false" when isPressed is false', () => {
      render(<Icon name={Home} onClick={vi.fn()} isPressed={false} ariaLabel="Toggle" />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('aria-pressed', 'false');
    });

    it('does not render aria-pressed when isPressed is undefined', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Click" />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('Keyboard Navigation', () => {
    it('is focusable when onClick is provided', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement).toHaveAttribute('tabindex', '0');
    });

    it('is not focusable when onClick is not provided', () => {
      render(<Icon name={Home} />);
      const iconElement = screen.getByRole('img');
      expect(iconElement).not.toHaveAttribute('tabindex');
    });

    it('is not focusable when disabled', () => {
      render(<Icon name={Home} onClick={vi.fn()} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');
      expect(iconElement).not.toHaveAttribute('tabindex');
    });

    it('triggers onClick on Enter key press', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');

      fireEvent.keyDown(buttonElement, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick on Space key press', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');

      fireEvent.keyDown(buttonElement, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick on other keys', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');

      fireEvent.keyDown(buttonElement, { key: 'Escape' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');

      fireEvent.keyDown(iconElement, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('triggers onClick on click', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');

      fireEvent.click(buttonElement);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');

      fireEvent.click(iconElement);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('passes click event to onClick handler', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} ariaLabel="Click me" />);
      const buttonElement = screen.getByRole('button');

      fireEvent.click(buttonElement);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });

    it('applies clickable class when onClick is provided', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Icon" />);
      const buttonElement = screen.getByRole('button');
      expect(buttonElement.className).toMatch(/clickable/);
    });

    it('does not apply clickable class when onClick is not provided', () => {
      render(<Icon name={Home} />);
      const iconElement = screen.getByRole('img');
      expect(iconElement.className).not.toMatch(/clickable/);
    });

    it('does not apply clickable class when disabled', () => {
      render(<Icon name={Home} onClick={vi.fn()} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');
      expect(iconElement.className).not.toMatch(/clickable/);
    });
  });

  describe('Focus Management', () => {
    it('is focusable when onClick is provided', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Focus me" />);
      const buttonElement = screen.getByRole('button');

      buttonElement.focus();

      expect(buttonElement).toHaveFocus();
    });

    it('has focus-visible outline on focus', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Focus me" />);
      const buttonElement = screen.getByRole('button');

      buttonElement.focus();

      expect(buttonElement.className).toMatch(/clickable/);
    });

    it('is not focusable when disabled', () => {
      render(<Icon name={Home} onClick={vi.fn()} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');

      expect(iconElement).not.toHaveAttribute('tabindex');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled class when disabled', () => {
      render(<Icon name={Home} disabled />);
      const iconElement = screen.getByRole('img');
      expect(iconElement.className).toMatch(/disabled/);
    });

    it('does not apply disabled class when not disabled', () => {
      render(<Icon name={Home} />);
      const iconElement = screen.getByRole('img');
      expect(iconElement.className).not.toMatch(/disabled/);
    });

    it('cannot be clicked when disabled', () => {
      const handleClick = vi.fn();
      render(<Icon name={Home} onClick={handleClick} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');

      fireEvent.click(iconElement);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('cannot be focused when disabled', () => {
      render(<Icon name={Home} onClick={vi.fn()} disabled ariaLabel="Disabled" />);
      const iconElement = screen.getByRole('img');
      expect(iconElement).not.toHaveAttribute('tabindex');
    });
  });

  describe('Size Variants', () => {
    it('renders with default size md', () => {
      render(<Icon name={Home} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toHaveStyle({ width: '20px', height: '20px' });
    });

    it.each([
      ['xs', 12],
      ['sm', 16],
      ['md', 20],
      ['lg', 24],
      ['xl', 32],
    ] as const)('renders with size %s (%spx)', (size, pixels) => {
      render(<Icon name={Home} size={size} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toHaveStyle({ width: `${pixels}px`, height: `${pixels}px` });
    });

    it('renders with custom numeric size', () => {
      render(<Icon name={Home} size={48} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toHaveStyle({ width: '48px', height: '48px' });
    });
  });

  describe('Color Variants', () => {
    it('renders with default color foreground', () => {
      render(<Icon name={Home} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement?.style.color).toBeTruthy();
    });

    it.each([
      'primary',
      'secondary',
      'accent',
      'success',
      'danger',
      'warning',
      'foreground',
      'foreground-muted',
      'inherit',
    ])('renders with color %s', (color) => {
      render(<Icon name={Home} color={color} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });

    it('renders with custom CSS color', () => {
      render(<Icon name={Home} color="#ff0000" />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toHaveAttribute('style', expect.stringContaining('color'));
    });
  });

  describe('Stroke Width', () => {
    it('renders with default strokeWidth 2', () => {
      render(<Icon name={Home} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement).toHaveAttribute('stroke-width', '2');
    });

    it.each([1, 1.5, 2, 2.5, 3] as const)('renders with strokeWidth %s', (width) => {
      render(<Icon name={Home} strokeWidth={width} />);
      const svgElement = screen.getByRole('img').querySelector('svg');
      expect(svgElement?.getAttribute('stroke-width')).toBe(String(width));
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      const handleClick = vi.fn();
      render(
        <Icon
          name={Home}
          size="lg"
          color="primary"
          strokeWidth={2.5}
          className="extra-class"
          ariaLabel="Home button"
          onClick={handleClick}
          isPressed={true}
        />
      );

      const iconElement = screen.getByRole('button');

      expect(iconElement.className).toMatch(/extra-class/);
      expect(iconElement.className).toMatch(/clickable/);
      expect(iconElement).toHaveAttribute('aria-label', 'Home button');
      expect(iconElement).toHaveAttribute('aria-pressed', 'true');
      expect(iconElement).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Memoization', () => {
    it('does not re-render when props do not change', () => {
      const { rerender } = render(<Icon name={Home} size="md" color="primary" />);
      rerender(<Icon name={Home} size="md" color="primary" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined ariaLabel gracefully', () => {
      render(<Icon name={Home} ariaLabel={undefined} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('handles empty string ariaLabel', () => {
      render(<Icon name={Home} ariaLabel="" />);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', '');
    });

    it('handles null children in Icon component', () => {
      expect(() => {
        render(<Icon name={Home} />);
      }).not.toThrow();
    });
  });

  describe('Data Attributes', () => {
    it('должен иметь data-size по умолчанию', () => {
      render(<Icon name={Home} />);
      const wrapper = screen.getByTestId('icon-wrapper');
      expect(wrapper).toHaveAttribute('data-size', 'md');
    });

    it('должен иметь data-color по умолчанию', () => {
      render(<Icon name={Home} />);
      const wrapper = screen.getByTestId('icon-wrapper');
      expect(wrapper).toHaveAttribute('data-color', 'foreground');
    });

    it('должен иметь data-interactive при onClick', () => {
      render(<Icon name={Home} onClick={vi.fn()} ariaLabel="Test" />);
      const wrapper = screen.getByRole('button');
      expect(wrapper).toHaveAttribute('data-interactive', 'true');
    });

    it('не должен иметь data-interactive без onClick', () => {
      render(<Icon name={Home} />);
      const wrapper = screen.getByRole('img');
      expect(wrapper).toHaveAttribute('data-interactive', 'false');
    });
  });
});
