import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarFallback } from './AvatarFallback';

describe('AvatarFallback', () => {
  it('renders with default props', () => {
    render(<AvatarFallback />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders single initial for single name', () => {
    render(<AvatarFallback name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders two initials for full name', () => {
    render(<AvatarFallback name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('respects maxInitials prop', () => {
    render(<AvatarFallback name="John Doe Smith" maxInitials={3} />);
    expect(screen.getByText('JDS')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<AvatarFallback size="sm" />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback.className).toContain('sm');
  });

  it('renders with medium size', () => {
    const { container } = render(<AvatarFallback size="md" />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback.className).toContain('md');
  });

  it('renders with large size', () => {
    const { container } = render(<AvatarFallback size="lg" />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback.className).toContain('lg');
  });

  it('renders with extra large size', () => {
    const { container } = render(<AvatarFallback size="xl" />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback.className).toContain('xl');
  });

  it('applies consistent color for same name', () => {
    render(<AvatarFallback name="John" />);
    const firstColor = screen.getByRole('generic').style.backgroundColor;
    screen.getByRole('generic').remove();
    render(<AvatarFallback name="John" />);
    const secondColor = screen.getByRole('generic').style.backgroundColor;
    expect(firstColor).toBe(secondColor);
  });

  it('applies different colors for different names', () => {
    const { container: container1 } = render(<AvatarFallback name="John" />);
    const firstColor = (container1.firstChild as HTMLElement).style.backgroundColor;
    const { container: container2 } = render(<AvatarFallback name="Jane" />);
    const secondColor = (container2.firstChild as HTMLElement).style.backgroundColor;
    expect(firstColor).not.toBe(secondColor);
  });

  it('renders with custom className', () => {
    const { container } = render(<AvatarFallback className="custom-fallback" />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback.className).toContain('custom-fallback');
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<AvatarFallback />);
    const fallback = container.firstChild as HTMLElement;
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles empty name', () => {
    const { container } = render(<AvatarFallback name="" />);
    const fallback = container.firstChild as HTMLElement;
    const initials = fallback.querySelector('.initials');
    expect(initials?.textContent ?? '').toBe('');
  });

  it('handles special characters in name', () => {
    render(<AvatarFallback name="José María" />);
    expect(screen.getByText('JM')).toBeInTheDocument();
  });
});
