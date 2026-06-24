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
