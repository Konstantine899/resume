// src/shared/ui/Link/ui/LinkSkeleton/LinkSkeleton.test.tsx

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkSkeleton } from './LinkSkeleton';
import { Link } from '../Link';
import linkStyles from '../Link.module.scss';

describe('LinkSkeleton', () => {
  it('should render a span with aria-disabled and data-skeleton', () => {
    render(<LinkSkeleton className={linkStyles.link} />);

    const skeleton = screen.getByRole('status').closest('span');
    expect(skeleton).toHaveAttribute('aria-disabled', 'true');
    expect(skeleton).toHaveAttribute('data-skeleton', 'true');
  });

  it('should apply the injected className to the wrapper span', () => {
    render(<LinkSkeleton className="custom-skeleton-class" />);

    const skeleton = screen.getByRole('status').closest('span');
    expect(skeleton).toHaveClass('custom-skeleton-class');
  });

  it('should render a Skeleton variant="text" inside the placeholder', () => {
    render(<LinkSkeleton className={linkStyles.link} />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('data-variant', 'text');
    expect(skeleton).toHaveClass(linkStyles.skeletonPlaceholder);
  });

  it('should not render an anchor element', () => {
    render(<LinkSkeleton className={linkStyles.link} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('Link skeleton delegation', () => {
  it('should delegate to LinkSkeleton when skeleton=true (no anchor in DOM)', () => {
    render(
      <Link href="/profile" skeleton>
        Profile
      </Link>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should keep the skeleton modifier class on the delegated placeholder', () => {
    render(
      <Link href="/profile" skeleton>
        Profile
      </Link>
    );

    const skeleton = screen.getByRole('status').closest('span');
    expect(skeleton?.className).toMatch(/skeleton/);
  });
});
