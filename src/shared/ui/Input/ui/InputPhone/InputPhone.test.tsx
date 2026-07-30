import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputPhone } from './InputPhone';

describe('InputPhone', () => {
  it('renders with tel type and phone icon', () => {
    render(<InputPhone label="Phone" />);
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('role', 'tel');
  });

  it('has default phone placeholder', () => {
    render(<InputPhone label="Phone" />);
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument();
  });

  it('accepts custom placeholder', () => {
    render(<InputPhone label="Phone" placeholder="Enter phone..." />);
    expect(screen.getByPlaceholderText('Enter phone...')).toBeInTheDocument();
  });

  it('has autocomplete="tel"', () => {
    render(<InputPhone label="Phone" />);
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('autocomplete', 'tel');
  });

  it('accepts custom autoComplete', () => {
    render(<InputPhone label="Phone" autoComplete="mobile tel" />);
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('autocomplete', 'mobile tel');
  });

  it('forwards value and onChange', async () => {
    const handleChange = vi.fn();
    render(<InputPhone label="Phone" value="+123" onChange={handleChange} />);
    const input = screen.getByLabelText('Phone');
    await userEvent.type(input, '4');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error state', () => {
    render(<InputPhone label="Phone" error="Invalid format" />);
    expect(screen.getByText('Invalid format')).toBeInTheDocument();
  });

  it('supports required prop', () => {
    render(<InputPhone label="Phone" required />);
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('required');
  });
});
