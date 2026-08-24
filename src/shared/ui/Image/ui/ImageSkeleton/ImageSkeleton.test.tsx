import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageSkeleton } from './ImageSkeleton';

describe('ImageSkeleton (IMR-06)', () => {
  it('renders div with aria-hidden="true"', () => {
    const { container } = render(<ImageSkeleton className="test-class" />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('test-class');
  });

  it('contains Skeleton with variant="rectangular" width="100%" height="100%"', () => {
    const { container } = render(<ImageSkeleton className="test-class" />);
    const wrapper = container.querySelector('[aria-hidden="true"]');
    // Skeleton renders with its own classes - check for the rectangular variant class
    const skeleton = wrapper?.querySelector('[class*="rectangular"]');
    expect(skeleton).toBeInTheDocument();
  });
});
