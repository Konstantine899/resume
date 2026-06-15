import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AvatarStatus } from './AvatarStatus';

describe('AvatarStatus', () => {
  it('renders with online status', () => {
    const { container } = render(<AvatarStatus status="online" />);
    const status = container.firstChild as HTMLElement;
    expect(status.className).toContain('status');
    expect(status.className).toContain('online');
  });

  it('renders with offline status', () => {
    const { container } = render(<AvatarStatus status="offline" />);
    const status = container.firstChild as HTMLElement;
    expect(status.className).toContain('offline');
  });

  it('renders with busy status', () => {
    const { container } = render(<AvatarStatus status="busy" />);
    const status = container.firstChild as HTMLElement;
    expect(status.className).toContain('busy');
  });

  it('renders with away status', () => {
    const { container } = render(<AvatarStatus status="away" />);
    const status = container.firstChild as HTMLElement;
    expect(status.className).toContain('away');
  });

  it('applies correct background color for online', () => {
    const { container } = render(<AvatarStatus status="online" />);
    const status = container.firstChild as HTMLElement;
    expect(status).toHaveStyle({ backgroundColor: 'rgb(34, 197, 94)' });
  });

  it('applies correct background color for offline', () => {
    const { container } = render(<AvatarStatus status="offline" />);
    const status = container.firstChild as HTMLElement;
    expect(status).toHaveStyle({ backgroundColor: 'rgb(156, 163, 175)' });
  });

  it('applies correct background color for busy', () => {
    const { container } = render(<AvatarStatus status="busy" />);
    const status = container.firstChild as HTMLElement;
    expect(status).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' });
  });

  it('renders with custom className', () => {
    const { container } = render(<AvatarStatus status="online" className="custom-status" />);
    const status = container.firstChild as HTMLElement;
    expect(status.className).toContain('custom-status');
  });

  it('has title attribute with status value', () => {
    const { container } = render(<AvatarStatus status="online" />);
    const status = container.firstChild as HTMLElement;
    expect(status).toHaveAttribute('title', 'online');
  });
});
