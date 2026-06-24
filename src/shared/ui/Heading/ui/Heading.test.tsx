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
      const { container } = render(<Heading>Test</Heading>);
      expect(container.querySelector('h2')).toBeInTheDocument();
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

    it('matches snapshot for default props', () => {
      const { container } = render(<Heading>Test Heading</Heading>);
      expect(container).toMatchSnapshot();
    });
  });

  describe('Heading Levels', () => {
    it.each([1, 2, 3, 4, 5, 6])('renders correct tag h%s', (level) => {
      const { container } = render(<Heading level={level as 1 | 2 | 3 | 4 | 5 | 6}>Test</Heading>);
      expect(container.querySelector(`h${level}`)).toBeInTheDocument();
    });

    it('warns in development for invalid level', () => {
      render(<Heading level={7 as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid level'));
    });

    it('matches snapshot for each level', () => {
      [1, 2, 3, 4, 5, 6].forEach((level) => {
        const { container } = render(
          <Heading level={level as 1 | 2 | 3 | 4 | 5 | 6}>Level {level}</Heading>
        );
        expect(container).toMatchSnapshot(`level-${level}`);
      });
    });
  });

  describe('Size Variants', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;

    it.each(sizes)('renders with size %s', (size) => {
      const { container } = render(<Heading size={size}>Test</Heading>);
      const element = container.querySelector('.heading');
      expect(element?.className).toContain(
        `heading--${size === '2xl' || size === '3xl' || size === '4xl' || size === '5xl' ? 'size-' : ''}${size}`
      );
    });

    it('warns in development for invalid size', () => {
      render(<Heading size={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid size'));
    });

    it('matches snapshot for each size', () => {
      sizes.forEach((size) => {
        const { container } = render(<Heading size={size}>Size {size}</Heading>);
        expect(container).toMatchSnapshot(`size-${size}`);
      });
    });
  });

  describe('Theme Variants', () => {
    const themes = ['primary', 'muted', 'inverted', 'error', 'gradient'] as const;

    it.each(themes)('renders with theme %s', (theme) => {
      const { container } = render(<Heading theme={theme}>Test</Heading>);
      const element = container.querySelector('.heading');
      expect(element?.className).toContain(`heading--theme-${theme}`);
    });

    it('warns in development for invalid theme', () => {
      render(<Heading theme={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid theme'));
    });

    it('matches snapshot for each theme', () => {
      themes.forEach((theme) => {
        const { container } = render(<Heading theme={theme}>Theme {theme}</Heading>);
        expect(container).toMatchSnapshot(`theme-${theme}`);
      });
    });
  });

  describe('Align Variants', () => {
    const aligns = ['left', 'center', 'right'] as const;

    it.each(aligns)('renders with align %s', (align) => {
      const { container } = render(<Heading align={align}>Test</Heading>);
      const element = container.querySelector('.heading');
      expect(element?.className).toContain(`heading--align-${align}`);
    });

    it('warns in development for invalid align', () => {
      render(<Heading align={'invalid' as any}>Test</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid align'));
    });

    it('matches snapshot for each align', () => {
      aligns.forEach((align) => {
        const { container } = render(<Heading align={align}>Align {align}</Heading>);
        expect(container).toMatchSnapshot(`align-${align}`);
      });
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

    it('warns in development when children is missing', () => {
      render(<Heading>{null}</Heading>);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('children prop is required')
      );
    });

    it('matches snapshot with accessibility props', () => {
      const { container } = render(
        <Heading id="a11y-test" aria-label="Accessibility Test">
          A11y
        </Heading>
      );
      expect(container).toMatchSnapshot('accessibility');
    });
  });

  describe('Combined Props', () => {
    it('renders with all props combined', () => {
      const { container } = render(
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

      const element = container.querySelector('h1');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('id', 'main-title');
      expect(element).toHaveAttribute('aria-label', 'Main Title');
      expect(element).toHaveClass('extra-class');
    });

    it('matches snapshot for combined props', () => {
      const { container } = render(
        <Heading level={2} size="4xl" theme="primary" align="left" id="combined-test">
          Combined Props Test
        </Heading>
      );
      expect(container).toMatchSnapshot('combined-props');
    });
  });

  describe('Memoization', () => {
    it('does not re-render when props do not change', () => {
      const { container, rerender } = render(<Heading>Test</Heading>);
      const firstElement = container.querySelector('.heading');

      rerender(<Heading>Test</Heading>);
      const secondElement = container.querySelector('.heading');

      expect(firstElement).toBe(secondElement);
    });
  });
});
