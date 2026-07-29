import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputSearch } from './InputSearch';

describe('InputSearch', () => {
  it('renders with search icon and clearable', () => {
    render(<InputSearch label="Search" />);
    const input = screen.getByLabelText('Search');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('role', 'searchbox');
  });

  it('renders with default placeholder', () => {
    render(<InputSearch label="Search" />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('accepts custom placeholder', () => {
    render(<InputSearch label="Search" placeholder="Find..." />);
    expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument();
  });

  it('clears value on clear button click', async () => {
    const user = userEvent.setup();
    render(<InputSearch label="Search" defaultValue="query" />);
    const input = screen.getByLabelText('Search');
    expect(input).toHaveValue('query');
    const clear = screen.getByRole('button', { name: /clear/i });
    await user.click(clear);
    expect(input).toHaveValue('');
  });

  it('displays error state', () => {
    render(<InputSearch label="Search" error="Not found" />);
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });
});
