import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarImage } from './AvatarImage';

describe('AvatarImage', () => {
  it('renders with required props', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test.jpg');
    expect(image).toHaveAttribute('alt', 'Test');
  });

  it('renders with default size', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('md');
  });

  it('renders with small size', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" size="sm" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('sm');
  });

  it('renders with large size', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" size="lg" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('lg');
  });

  it('renders with circle variant', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" variant="circle" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('circle');
  });

  it('renders with square variant', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" variant="square" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('square');
  });

  it('calls onError callback when image fails', () => {
    const onError = vi.fn();
    render(<AvatarImage src="/invalid.jpg" alt="Test" onError={onError} />);
    const image = screen.getByRole('img');
    image.dispatchEvent(new Event('error', { bubbles: true }));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad callback when image loads', () => {
    const onLoad = vi.fn();
    render(<AvatarImage src="/test.jpg" alt="Test" onLoad={onLoad} />);
    const image = screen.getByRole('img');
    image.dispatchEvent(new Event('load', { bubbles: true }));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" className="custom-image" />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('custom-image');
  });

  it('uses lazy loading', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('uses async decoding', () => {
    render(<AvatarImage src="/test.jpg" alt="Test" />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('decoding', 'async');
  });
});
