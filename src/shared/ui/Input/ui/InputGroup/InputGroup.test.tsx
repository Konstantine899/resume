import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputGroup } from './InputGroup';

describe('InputGroup', () => {
  it('renders children correctly', () => {
    render(
      <InputGroup>
        <input data-testid="input" />
      </InputGroup>
    );
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('applies inputGroup class', () => {
    const { container } = render(<InputGroup>Content</InputGroup>);
    const div = container.querySelector('div');
    expect(div?.className).toContain('inputGroup');
  });

  it('applies data-testid attribute', () => {
    render(
      <InputGroup data-testid="group">
        <input />
      </InputGroup>
    );
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <InputGroup>
        <span>Prefix</span>
        <input data-testid="input" />
        <span>Suffix</span>
      </InputGroup>
    );
    expect(screen.getByText('Prefix')).toBeInTheDocument();
    expect(screen.getByText('Suffix')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  describe('InputGroup.Addon', () => {
    it('renders addon with children', () => {
      render(<InputGroup.Addon>$</InputGroup.Addon>);
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('applies addonStart class by default', () => {
      const { container } = render(<InputGroup.Addon>Start</InputGroup.Addon>);
      const span = container.querySelector('span');
      expect(span?.className).toContain('addonStart');
    });

    it('applies addonStart class when position="start"', () => {
      const { container } = render(<InputGroup.Addon position="start">Start</InputGroup.Addon>);
      const span = container.querySelector('span');
      expect(span?.className).toContain('addonStart');
    });

    it('applies addonEnd class when position="end"', () => {
      const { container } = render(<InputGroup.Addon position="end">End</InputGroup.Addon>);
      const span = container.querySelector('span');
      expect(span?.className).toContain('addonEnd');
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <InputGroup.Addon className="custom-addon">Content</InputGroup.Addon>
      );
      expect(container.querySelector('.custom-addon')).toBeInTheDocument();
    });

    it('renders icon as children', () => {
      render(
        <InputGroup.Addon>
          <svg data-testid="icon" />
        </InputGroup.Addon>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders text content', () => {
      render(<InputGroup.Addon>USD</InputGroup.Addon>);
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders group with addon and input', () => {
      render(
        <InputGroup data-testid="group">
          <InputGroup.Addon position="start" data-testid="start-addon">
            $
          </InputGroup.Addon>
          <input data-testid="input" />
          <InputGroup.Addon position="end" data-testid="end-addon">
            .00
          </InputGroup.Addon>
        </InputGroup>
      );

      expect(screen.getByTestId('group')).toBeInTheDocument();
      expect(screen.getByTestId('start-addon')).toBeInTheDocument();
      expect(screen.getByTestId('end-addon')).toBeInTheDocument();
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });
  });
});
