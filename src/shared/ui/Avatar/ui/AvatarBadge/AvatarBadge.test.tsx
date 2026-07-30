import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarBadge } from './AvatarBadge';
import styles from './AvatarBadge.module.scss';

describe('AvatarBadge', () => {
  it('renders with default status (offline)', () => {
    const { container } = render(<AvatarBadge />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(styles.badge);
    expect(badge).toHaveClass(styles.statusOffline);
  });

  it('renders with online status', () => {
    const { container } = render(<AvatarBadge status="online" />);
    expect(container.firstChild).toHaveClass(styles.statusOnline);
  });

  it('renders with busy status', () => {
    const { container } = render(<AvatarBadge status="busy" />);
    expect(container.firstChild).toHaveClass(styles.statusBusy);
  });

  it('renders with away status', () => {
    const { container } = render(<AvatarBadge status="away" />);
    expect(container.firstChild).toHaveClass(styles.statusAway);
  });

  it('has role="status"', () => {
    render(<AvatarBadge />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<AvatarBadge status="online" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: online');
  });

  it('accepts custom aria-label', () => {
    render(<AvatarBadge status="busy" aria-label="User is busy" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'User is busy');
  });

  it('applies custom className', () => {
    const { container } = render(<AvatarBadge className="custom-badge" />);
    expect(container.firstChild).toHaveClass('custom-badge');
  });

  it('sets correct size for sm', () => {
    const { container } = render(<AvatarBadge size="sm" />);
    expect(container.firstChild).toHaveStyle({ width: '12px', height: '12px' });
  });

  it('sets correct size for md', () => {
    const { container } = render(<AvatarBadge size="md" />);
    expect(container.firstChild).toHaveStyle({ width: '16px', height: '16px' });
  });

  it('sets correct size for xl', () => {
    const { container } = render(<AvatarBadge size="xl" />);
    expect(container.firstChild).toHaveStyle({ width: '20px', height: '20px' });
  });
});
