import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { About } from './About';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));
vi.mock('@/shared/ui/Avatar', () => ({
  AvatarAbout: () => <div data-testid="mock-avatar" />,
}));

describe('About: Link CTA integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the "get in touch" CTA as a Link pointing to #contact', () => {
    render(<About />);

    const cta = screen.getByRole('link', { name: /getInTouch/ });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '#contact');
  });
});
