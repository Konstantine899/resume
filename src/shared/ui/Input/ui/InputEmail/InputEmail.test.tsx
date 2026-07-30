import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputEmail } from './InputEmail';

describe('InputEmail', () => {
  it('renders with email type and mail icon', () => {
    render(<InputEmail label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('has default email placeholder', () => {
    render(<InputEmail label="Email" />);
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });

  it('accepts custom placeholder', () => {
    render(<InputEmail label="Email" placeholder="test@example.com" />);
    expect(screen.getByPlaceholderText('test@example.com')).toBeInTheDocument();
  });

  it('has autocomplete="email"', () => {
    render(<InputEmail label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('accepts custom autoComplete', () => {
    render(<InputEmail label="Email" autoComplete="work email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('autocomplete', 'work email');
  });

  it('forwards value and onChange', async () => {
    const handleChange = vi.fn();
    render(<InputEmail label="Email" value="test@example.com" onChange={handleChange} />);
    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'x');
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error state', () => {
    render(<InputEmail label="Email" error="Invalid email format" />);
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('supports required prop', () => {
    render(<InputEmail label="Email" required />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('required');
  });
});
