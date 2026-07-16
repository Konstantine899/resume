import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(<Heading>Test Heading</Heading>);
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('renders with default level h2', () => {
      render(<Heading>Test</Heading>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('forwards data-testid attribute', () => {
      render(<Heading data-testid="custom-heading">Test</Heading>);
      expect(screen.getByTestId('custom-heading')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Heading className="custom-class">Test</Heading>);
      const element = screen.getByText('Test');
      expect(element).toHaveClass('custom-class');
    });
  });

  describe('Heading Levels', () => {
    it.each([1, 2, 3, 4, 5, 6])('renders correct tag h%s', (level) => {
      render(<Heading level={level as 1 | 2 | 3 | 4 | 5 | 6}>Test</Heading>);
      expect(screen.getByRole('heading', { level })).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;

    it.each(sizes)('renders with size %s', (size) => {
      render(<Heading size={size}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Theme Variants', () => {
    const themes = ['primary', 'muted', 'inverted', 'error', 'gradient'] as const;

    it.each(themes)('renders with theme %s', (theme) => {
      render(<Heading theme={theme}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Align Variants', () => {
    const aligns = ['left', 'center', 'right'] as const;

    it.each(aligns)('renders with align %s', (align) => {
      render(<Heading align={align}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders with id attribute', () => {
      render(<Heading id="test-id">Test</Heading>);
      expect(screen.getByText('Test')).toHaveAttribute('id', 'test-id');
    });

    it('renders with aria-label attribute', () => {
      render(<Heading aria-label="Test Label">Test</Heading>);
      expect(screen.getByText('Test')).toHaveAttribute('aria-label', 'Test Label');
    });

    it('renders with aria-labelledby attribute', () => {
      render(<Heading aria-labelledby="label-id">Test</Heading>);
      expect(screen.getByText('Test')).toHaveAttribute('aria-labelledby', 'label-id');
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      render(
        <Heading
          level={1}
          size="3xl"
          theme="gradient"
          align="center"
          id="main-title"
          aria-label="Main Title"
          className="extra-class"
        >
          Full Featured Heading
        </Heading>
      );

      const element = screen.getByRole('heading', { level: 1 });
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('id', 'main-title');
      expect(element).toHaveAttribute('aria-label', 'Main Title');
      expect(element).toHaveClass('extra-class');
    });
  });

  describe('Memoization', () => {
    it('does not re-render when props do not change', () => {
      const { rerender } = render(<Heading>Test</Heading>);
      const firstElement = screen.getByRole('heading');

      rerender(<Heading>Test</Heading>);
      const secondElement = screen.getByRole('heading');

      expect(firstElement).toBe(secondElement);
    });
  });

  describe('Runtime Validation', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('warns in development for invalid level', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Heading level={7 as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid level'));
    });

    it('warns in development for invalid size', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Heading size={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid size'));
    });

    it('warns in development for invalid theme', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Heading theme={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid theme'));
    });

    it('warns in development for invalid align', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Heading align={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid align'));
    });

    it('warns in development when children is missing', () => {
      render(<Heading>{null}</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('children prop is required')
      );
    });
  });
});
