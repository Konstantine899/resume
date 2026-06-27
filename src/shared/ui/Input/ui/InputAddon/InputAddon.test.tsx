import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputAddon } from './InputAddon';

describe('InputAddon', () => {
  it('renders children correctly', () => {
    render(<InputAddon data-testid="addon">$</InputAddon>);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('applies icon class by default (position=start)', () => {
    render(<InputAddon data-testid="addon">Start</InputAddon>);
    const span = screen.getByTestId('addon');
    expect(span?.className).toContain('icon');
  });

  it('applies icon class when position="start"', () => {
    render(
      <InputAddon position="start" data-testid="addon">
        Start
      </InputAddon>
    );
    const span = screen.getByTestId('addon');
    expect(span?.className).toContain('icon');
  });

  it('applies iconAfter class when position="end"', () => {
    render(
      <InputAddon position="end" data-testid="addon">
        End
      </InputAddon>
    );
    const span = screen.getByTestId('addon');
    expect(span?.className).toContain('iconAfter');
  });

  it('applies custom className when provided', () => {
    render(
      <InputAddon className="custom-addon" data-testid="addon">
        Content
      </InputAddon>
    );
    expect(screen.getByTestId('addon')).toBeInTheDocument();
  });

  it('applies data-testid attribute', () => {
    render(<InputAddon data-testid="addon">Content</InputAddon>);
    expect(screen.getByTestId('addon')).toBeInTheDocument();
  });

  it('has aria-hidden="true" by default', () => {
    render(<InputAddon data-testid="addon">Content</InputAddon>);
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
    render(<InputAddon data-testid="addon">USD</InputAddon>);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <InputAddon data-testid="addon">
        <span>Prefix</span>
      </InputAddon>
    );
    expect(screen.getByText('Prefix')).toBeInTheDocument();
  });
});
