import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AvatarAbout } from './AvatarAbout';

describe('AvatarAbout', () => {
  it('renders with default size lg', () => {
    const { container } = render(<AvatarAbout alt="Test" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('lg');
  });

  it('renders with small size', () => {
    const { container } = render(<AvatarAbout alt="Test" size="sm" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('sm');
  });

  it('renders with medium size', () => {
    const { container } = render(<AvatarAbout alt="Test" size="md" showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('md');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <AvatarAbout alt="Test" className="custom-avatar" showSkeleton={false} />
    );
    const avatar = container.firstChild as HTMLElement;
    expect(avatar.className).toContain('custom-avatar');
  });

  it('renders skeleton when forceLoading', () => {
    const { container } = render(<AvatarAbout alt="Test" forceLoading />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('hides skeleton when showSkeleton is false', () => {
    const { container } = render(<AvatarAbout alt="Test" forceLoading showSkeleton={false} />);
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
  });

  it('has data-loading attribute when loading', () => {
    const { container } = render(<AvatarAbout alt="Test" forceLoading />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-loading', 'true');
  });

  it('calls handleError on image error', () => {
    const testSrc = 'test-image.jpg';
    const { container, rerender } = render(
      <AvatarAbout alt="Test" src={testSrc} showSkeleton={false} />
    );
    const img = container.querySelector('img') as HTMLImageElement;
    fireEvent.error(img);
    rerender(<AvatarAbout alt="Test" src={testSrc} showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-error', 'true');
  });

  it('calls handleLoad on image load', () => {
    const testSrc = 'test-image.jpg';
    const { container, rerender } = render(
      <AvatarAbout alt="Test" src={testSrc} showSkeleton={false} />
    );
    const img = container.querySelector('img') as HTMLImageElement;
    fireEvent.load(img);
    rerender(<AvatarAbout alt="Test" src={testSrc} showSkeleton={false} />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-loading', 'false');
  });
});
