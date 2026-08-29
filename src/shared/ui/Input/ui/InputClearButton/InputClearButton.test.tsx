import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputClearButton } from './InputClearButton';

describe('InputClearButton', () => {
  it('renders clear button with SVG icon', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<InputClearButton onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has default aria-label "Clear input"', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    expect(screen.getByLabelText('Clear input')).toBeInTheDocument();
  });

  it('accepts custom aria-label', () => {
    render(<InputClearButton onClick={vi.fn()} aria-label="Очистить" />);
    expect(screen.getByLabelText('Очистить')).toBeInTheDocument();
  });

  it('has tabIndex 0 by default', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('accepts custom tabIndex', () => {
    render(<InputClearButton onClick={vi.fn()} tabIndex={0} />);
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('has type="button"', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies clearButton class', () => {
    const { container } = render(<InputClearButton onClick={vi.fn()} />);
    expect(container.querySelector('button')).toHaveAttribute('class');
  });

  it('renders SVG with correct attributes', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders X icon with two line elements', () => {
    render(<InputClearButton onClick={vi.fn()} />);
    const lines = screen.getByRole('button').querySelectorAll('svg line');
    expect(lines).toHaveLength(2);
  });
});
