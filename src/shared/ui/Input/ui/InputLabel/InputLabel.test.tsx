import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputLabel } from './InputLabel';

describe('InputLabel', () => {
  it('renders label with htmlFor attribute', () => {
    render(<InputLabel htmlFor="test-input">Email</InputLabel>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders required indicator when required is true', () => {
    render(
      <InputLabel htmlFor="test-input" required>
        Email
      </InputLabel>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not render required indicator when required is false', () => {
    render(
      <InputLabel htmlFor="test-input" required={false}>
        Email
      </InputLabel>
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('applies floating label styles when floating is true', () => {
    const { container } = render(
      <InputLabel htmlFor="test-input" floating>
        Email
      </InputLabel>
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('floatingLabel');
  });

  it('applies default label styles when floating is false', () => {
    const { container } = render(
      <InputLabel htmlFor="test-input" floating={false}>
        Email
      </InputLabel>
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('label');
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <InputLabel htmlFor="test-input" className="custom-class">
        Email
      </InputLabel>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<InputLabel htmlFor="test-input">Custom Label Text</InputLabel>);
    expect(screen.getByText('Custom Label Text')).toBeInTheDocument();
  });

  it('renders required indicator and label text', () => {
    render(
      <InputLabel htmlFor="test-input" required>
        Email
      </InputLabel>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });
});
