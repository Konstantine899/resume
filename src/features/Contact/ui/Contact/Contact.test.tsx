import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { CONTACT_EMAIL } from '@/entities/ContactContent';
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
  CardGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-grid">{children}</div>
  ),
}));

describe('Contact: social links integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a visible mailto link plus one external Link per social link', () => {
    render(<Contact />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(4);

    // The direct email is a plain mailto — never opened in a new tab.
    const mailto = links.find((link) => link.getAttribute('href')?.startsWith('mailto:'));
    expect(mailto).toBeDefined();
    expect(mailto).toHaveTextContent(CONTACT_EMAIL);
    expect(mailto).not.toHaveAttribute('target');

    const external = links.filter((link) => link !== mailto);
    expect(external).toHaveLength(SOCIAL_LINKS.length);
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank');
      const rel = link.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  it('renders the response-time hint via i18n (recruiter audit P1)', () => {
    render(<Contact />);

    expect(screen.getByText('responseTimeHint')).toBeInTheDocument();
  });

  it('does NOT render the redundant "Opens in new tab" external icon (W-R1)', () => {
    render(<Contact />);

    // showExternalIcon={false} — the social links already ship their own icons
    expect(screen.queryAllByLabelText('Opens in new tab')).toHaveLength(0);
  });
});
