import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Heading } from './Heading';

describe('Heading', () => {
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

    it('forwards id attribute', () => {
      render(<Heading id="test-id">Test</Heading>);
      expect(screen.getByText('Test')).toHaveAttribute('id', 'test-id');
    });
  });

  describe('Heading Levels', () => {
    it.each([1, 2, 3, 4, 5, 6])('renders correct tag h%s', (level) => {
      render(<Heading level={level as 1 | 2 | 3 | 4 | 5 | 6}>Test</Heading>);
      expect(screen.getByRole('heading', { level })).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl'] as const;

    it.each(sizes)('renders with size %s and data-size attribute', (size) => {
      render(<Heading size={size}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toHaveAttribute('data-size', size);
    });
  });

  describe('Theme Variants', () => {
    const themes = ['primary', 'muted', 'inverted', 'error', 'gradient'] as const;

    it.each(themes)('renders with theme %s and data-theme attribute', (theme) => {
      render(<Heading theme={theme}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toHaveAttribute('data-theme', theme);
    });
  });

  describe('Align Variants', () => {
    const aligns = ['left', 'center', 'right'] as const;

    it.each(aligns)('renders with align %s and data-align attribute', (align) => {
      render(<Heading align={align}>Test</Heading>);
      const element = screen.getByRole('heading');
      expect(element).toHaveAttribute('data-align', align);
    });
  });

  describe('Accessibility', () => {
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
    it('is memoized with React.memo', () => {
      // React.memo компоненты имеют Symbol.for('react.memo') в $$typeof
      const memoType = (Heading as unknown as { $$typeof?: symbol }).$$typeof;
      expect(memoType).toBe(Symbol.for('react.memo'));
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the rendered heading element', () => {
      const ref = createRef<HTMLHeadingElement>();
      render(<Heading ref={ref}>Test</Heading>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current?.textContent).toBe('Test');
    });

    it('forwards ref when as="div"', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Heading as="div" ref={ref}>
          Test
        </Heading>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Polymorphic Rendering', () => {
    it('renders as h2 by default', () => {
      render(<Heading>Test</Heading>);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders as div when as="div"', () => {
      render(<Heading as="div">Test</Heading>);
      const element = screen.getByText('Test');
      expect(element.tagName).toBe('DIV');
    });

    it('renders as span when as="span"', () => {
      render(<Heading as="span">Test</Heading>);
      const element = screen.getByText('Test');
      expect(element.tagName).toBe('SPAN');
    });

    it('preserves heading level attribute when rendered as div', () => {
      render(
        <Heading as="div" level={1}>
          Test
        </Heading>
      );
      const element = screen.getByText('Test');
      expect(element).toHaveAttribute('data-level', '1');
    });

    it('preserves style classes on polymorphic element', () => {
      render(
        <Heading as="div" size="xl" theme="gradient" align="center">
          Test
        </Heading>
      );
      const element = screen.getByText('Test');
      expect(element.tagName).toBe('DIV');
    });
  });
});
