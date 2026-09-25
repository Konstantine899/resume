import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputCounter } from './InputCounter';

describe('InputCounter', () => {
  it('renders counter with current and max values', () => {
    render(<InputCounter current={5} max={100} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('applies warning class when approaching threshold', () => {
    const { container } = render(<InputCounter current={90} max={100} />);
    const warningSpan = container.querySelector('span[class*="warning"]');
    expect(warningSpan).toBeInTheDocument();
  });

  it('does not apply warning class when below threshold', () => {
    const { container } = render(<InputCounter current={50} max={100} />);
    const warningSpan = container.querySelector('span[class*="warning"]');
    expect(warningSpan).not.toBeInTheDocument();
  });

  it('uses custom warning threshold', () => {
    const { container } = render(<InputCounter current={60} max={100} warningThreshold={0.5} />);
    const warningSpan = container.querySelector('span[class*="warning"]');
    expect(warningSpan).toBeInTheDocument();
  });

  it('applies data-testid attribute', () => {
    render(<InputCounter current={5} max={100} data-testid="counter" />);
    expect(screen.getByTestId('counter')).toBeInTheDocument();
  });

  it('announces politely via aria-live and role="status"', () => {
    render(<InputCounter current={5} max={100} data-testid="counter" />);
    const counter = screen.getByTestId('counter');
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveAttribute('role', 'status');
  });

  it('applies the provided id', () => {
    render(<InputCounter current={5} max={100} id="char-counter" />);
    expect(screen.getByText('5').closest('#char-counter')).toBeInTheDocument();
  });

  it('forwards ref to the counter span', () => {
    const ref = { current: null };
    render(<InputCounter ref={ref} current={5} max={100} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('renders at 100% capacity', () => {
    render(<InputCounter current={100} max={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('renders with zero count', () => {
    render(<InputCounter current={0} max={100} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies warning at exactly 90%', () => {
    const { container } = render(<InputCounter current={90} max={100} />);
    const warningSpan = container.querySelector('span[class*="warning"]');
    expect(warningSpan).toBeInTheDocument();
  });

  it('does not apply warning at 89%', () => {
    const { container } = render(<InputCounter current={89} max={100} />);
    const warningSpan = container.querySelector('span[class*="warning"]');
    expect(warningSpan).not.toBeInTheDocument();
  });
});
