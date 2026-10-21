import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AvatarImage } from './AvatarImage';

describe('AvatarImage', () => {
  it('renders with default size', () => {
    const { container } = render(<AvatarImage src="/test.jpg" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
  });

  it('has decorative alt (always empty for decorative images)', () => {
    const { container } = render(<AvatarImage src="/test.jpg" alt="User" />);
    const img = container.querySelector('img');
    // decorative prop overrides alt to empty
    expect(img).toHaveAttribute('alt', '');
  });

  it('has data-state attributes on wrapper', () => {
    const { container } = render(<AvatarImage src="/test.jpg" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-state');
    expect(wrapper).toHaveAttribute('data-size', 'md');
    expect(wrapper).toHaveAttribute('data-variant', 'circle');
  });

  it('sets data-size and data-variant', () => {
    const { container } = render(<AvatarImage src="/test.jpg" size="lg" variant="square" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-size', 'lg');
    expect(wrapper).toHaveAttribute('data-variant', 'square');
  });

  it('supports the portrait variant (transparent/contain/full, no fixed size)', () => {
    const { container } = render(<AvatarImage src="/portrait.png" variant="portrait" alt="" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('data-variant', 'portrait');

    // D14 mapping: portrait fills its consumer-owned box without chrome.
    const figure = container.querySelector('figure');
    expect(figure).toHaveAttribute('data-variant', 'transparent');
    expect(figure?.className ?? '').toContain('objectFitContain');
    expect(figure?.className ?? '').toContain('sizeFull');
    // No inline width/height — the fixed px size must not override size="full".
    expect((figure as HTMLElement).style.width).toBeFalsy();
    expect((figure as HTMLElement).style.height).toBeFalsy();
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<AvatarImage src="/test.jpg" className="custom-img" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-img');
  });

  it('shows skeleton when forceLoading', () => {
    const { container } = render(<AvatarImage src="/test.jpg" forceLoading />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('hides skeleton when showSkeleton is false', () => {
    const { container } = render(<AvatarImage src="/test.jpg" showSkeleton={false} />);
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
  });
});
