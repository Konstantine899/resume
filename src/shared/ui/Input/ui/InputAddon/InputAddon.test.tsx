import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputAddon } from './InputAddon';

describe('InputAddon', () => {
  it('renders children correctly', () => {
    render(<InputAddon>$</InputAddon>);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('applies icon class by default (position=start)', () => {
    const { container } = render(<InputAddon>Start</InputAddon>);
    const span = container.querySelector('span');
    expect(span?.className).toContain('icon');
  });

  it('applies icon class when position="start"', () => {
    const { container } = render(<InputAddon position="start">Start</InputAddon>);
    const span = container.querySelector('span');
    expect(span?.className).toContain('icon');
  });

  it('applies iconAfter class when position="end"', () => {
    const { container } = render(<InputAddon position="end">End</InputAddon>);
    const span = container.querySelector('span');
    expect(span?.className).toContain('iconAfter');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<InputAddon className="custom-addon">Content</InputAddon>);
    expect(container.querySelector('.custom-addon')).toBeInTheDocument();
  });

  it('applies data-testid attribute', () => {
    render(<InputAddon data-testid="addon">Content</InputAddon>);
    expect(screen.getByTestId('addon')).toBeInTheDocument();
  });

  it('has aria-hidden="true" by default', () => {
    render(<InputAddon>Content</InputAddon>);
    expect(screen.getByText('Content')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders icon as children', () => {
    render(
      <InputAddon data-testid="addon">
        <svg data-testid="icon" />
      </InputAddon>
    );
    expect(screen.getByTestId('addon')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders text content', () => {
    render(<InputAddon>USD</InputAddon>);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <InputAddon>
        <span>Prefix</span>
      </InputAddon>
    );
    expect(screen.getByText('Prefix')).toBeInTheDocument();
  });
});
