import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarBadge } from './AvatarBadge';

describe('AvatarBadge', () => {
  it('renders with default props', () => {
    const { container } = render(<AvatarBadge />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('badge');
    expect(badge.className).toContain('dot');
    expect(badge.className).toContain('online');
  });

  it('renders with online status', () => {
    const { container } = render(<AvatarBadge status="online" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('online');
  });

  it('renders with offline status', () => {
    const { container } = render(<AvatarBadge status="offline" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('offline');
  });

  it('renders with busy status', () => {
    const { container } = render(<AvatarBadge status="busy" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('busy');
  });

  it('renders with number variant and count', () => {
    const { container } = render(<AvatarBadge variant="number" count={5} />);
    expect(container).toHaveTextContent('5');
  });

  it('renders 99+ for count > 99', () => {
    const { container } = render(<AvatarBadge variant="number" count={150} />);
    expect(container).toHaveTextContent('99+');
  });

  it('renders nothing for count = 0 with number variant', () => {
    const { container } = render(<AvatarBadge variant="number" count={0} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.textContent).not.toContain('0');
  });

  it('renders icon variant', () => {
    const { container } = render(<AvatarBadge variant="icon" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.querySelector('.icon') ?? badge.children[0]).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<AvatarBadge className="custom-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('custom-class');
  });

  it('applies correct background color for status', () => {
    const { container } = render(<AvatarBadge status="online" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: 'rgb(34, 197, 94)' });
  });

  it('applies correct size for dot variant', () => {
    const { container } = render(<AvatarBadge variant="dot" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ width: '10px', height: '10px' });
  });

  it('has correct role and aria-label', () => {
    render(<AvatarBadge status="online" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status: online');
  });

  it('has tabIndex for keyboard accessibility', () => {
    render(<AvatarBadge />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('tabIndex', '0');
  });

  it('handles Enter key press', () => {
    render(<AvatarBadge />);
    const badge = screen.getByRole('status');
    fireEvent.keyDown(badge, { key: 'Enter' });
    expect(badge).toBeInTheDocument();
  });

  it('handles Space key press', () => {
    render(<AvatarBadge />);
    const badge = screen.getByRole('status');
    fireEvent.keyDown(badge, { key: ' ' });
    expect(badge).toBeInTheDocument();
  });
});
