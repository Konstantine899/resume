import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarSpinner } from './AvatarSpinner';

describe('AvatarSpinner', () => {
  it('renders with default size xl', () => {
    const { container } = render(<AvatarSpinner />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('spinner');
    expect(spinner.className).toContain('xl');
  });

  it('renders spinner for sm size', () => {
    const { container } = render(<AvatarSpinner size="sm" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('sm');
  });

  it('renders spinner for md size', () => {
    const { container } = render(<AvatarSpinner size="md" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('md');
  });

  it('renders spinner for lg size', () => {
    const { container } = render(<AvatarSpinner size="lg" />);
    const spinner = container.firstChild as HTMLElement;
    expect(spinner.className).toContain('lg');
  });

  it('has correct ARIA attributes', () => {
    render(<AvatarSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  it('uses custom aria-label', () => {
    render(<AvatarSpinner aria-label="Custom loading" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading');
  });

  it('renders outer ring element', () => {
    const { container } = render(<AvatarSpinner />);
    const spinner = container.firstChild as HTMLElement;
    const outerRing = spinner.querySelector(':scope > div:first-child');
    expect(outerRing).toBeInTheDocument();
  });

  it('renders inner ring element', () => {
    const { container } = render(<AvatarSpinner />);
    const spinner = container.firstChild as HTMLElement;
    const innerRing = spinner.querySelector(':scope > div:last-child');
    expect(innerRing).toBeInTheDocument();
  });
});
