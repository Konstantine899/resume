import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Contact } from './Contact';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));
vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));
vi.mock('@/shared/ui/Card', () => ({
  ContactCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="contact-card">{children}</div>
  ),
}));

describe('Contact: social links integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders one external Link per social link with _blank + noopener noreferrer', () => {
    render(<Contact />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);

    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      const rel = link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  it('does NOT render the redundant "Opens in new tab" external icon (W-R1)', () => {
    render(<Contact />);

    // showExternalIcon={false} — the social links already ship their own icons
    expect(screen.queryAllByLabelText('Opens in new tab')).toHaveLength(0);
  });
});
