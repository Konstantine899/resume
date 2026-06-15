import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarHero } from './AvatarHero';

describe('AvatarHero', () => {
  it('renders with default size xl', () => {
    const { container } = render(<AvatarHero alt="Test" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('xl');
  });

  it('renders with small size', () => {
    const { container } = render(<AvatarHero alt="Test" size="sm" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('sm');
  });

  it('renders with medium size', () => {
    const { container } = render(<AvatarHero alt="Test" size="md" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('md');
  });

  it('renders with large size', () => {
    const { container } = render(<AvatarHero alt="Test" size="lg" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('lg');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <AvatarHero alt="Test" className="custom-avatar" showSkeleton={false} />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('custom-avatar');
  });

  it('renders glow effect when showGlow is true', () => {
    const { container } = render(<AvatarHero alt="Test" showGlow showSkeleton={false} />);
    const glow = container.querySelector('[class*="photoGlow"]');
    expect(glow).toBeInTheDocument();
  });

  it('renders ring effect when showRing is true', () => {
    const { container } = render(<AvatarHero alt="Test" showRing showSkeleton={false} />);
    const ring = container.querySelector('[class*="photoRing"]');
    expect(ring).toBeInTheDocument();
  });

  it('renders both glow and ring effects', () => {
    const { container } = render(<AvatarHero alt="Test" showGlow showRing showSkeleton={false} />);
    const glow = container.querySelector('[class*="photoGlow"]');
    const ring = container.querySelector('[class*="photoRing"]');
    expect(glow).toBeInTheDocument();
    expect(ring).toBeInTheDocument();
  });

  it('renders skeleton when forceLoading', () => {
    render(<AvatarHero alt="Test" src="/test.jpg" forceLoading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('hides skeleton when showSkeleton is false', () => {
    render(<AvatarHero alt="Test" src="/test.jpg" forceLoading showSkeleton={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <AvatarHero alt="Test" showSkeleton={false}>
        <span data-testid="child">Child</span>
      </AvatarHero>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('has data-loading attribute when loading', () => {
    const { container } = render(<AvatarHero alt="Test" forceLoading />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-loading', 'true');
  });
});
