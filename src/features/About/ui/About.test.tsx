import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEVELOPER_DATA } from '@/entities/Developer';
import { About } from './About';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));
vi.mock('@/shared/ui/Image', () => ({
  Image: ({
    'data-testid': dataTestId,
    variant,
    className,
    src,
    alt,
  }: {
    'data-testid'?: string;
    variant?: string;
    className?: string;
    src?: string;
    alt?: string;
  }) => (
    <div
      data-testid={dataTestId ?? 'mock-image'}
      data-mock="image"
      data-variant={variant}
      data-src={src}
      data-alt={alt}
      className={className}
    />
  ),
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

  it('renders the bottom panel with the decorative accent line', () => {
    render(<About />);

    expect(screen.getByTestId('about-panel')).toBeInTheDocument();
    const accent = screen.getByTestId('about-accent');
    expect(accent).toBeInTheDocument();
    expect(accent).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the portrait with the transparent Image variant after the panel in the DOM', () => {
    render(<About />);

    const panel = screen.getByTestId('about-panel');
    const portrait = screen.getByTestId('about-portrait');
    expect(portrait).toBeInTheDocument();
    expect(portrait).toHaveAttribute('data-variant', 'transparent');
    // Portrait must come AFTER the panel so z-index paints it over the panel.
    expect(panel.compareDocumentPosition(portrait) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('owns the document h1 with the localized full name', () => {
    render(<About />);

    // Recruiter audit: About is the first section after the Hero removal, so it
    // carries the page h1. The name comes from i18n, not a hardcoded constant —
    // the previous version rendered DEVELOPER_DATA.fullName, which stayed
    // Russian in English mode.
    expect(screen.getByRole('heading', { level: 1, name: 'fullName' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'about' })).not.toBeInTheDocument();
  });

  it('renders the role under the h1 and keeps the pitch at heading-free levels', () => {
    render(<About />);

    expect(screen.getByText('developerRole')).toBeInTheDocument();
    // Only the h1 may claim a heading role in this section — no stray h2/h3
    // above the name, so the document outline starts at level 1.
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('renders the translated description and CTA via i18n keys', () => {
    render(<About />);

    expect(screen.getByText('aboutDescription')).toBeInTheDocument();
    expect(screen.getByText('getInTouch')).toBeInTheDocument();
  });

  it('renders the expanded 3-paragraph pitch (recruiter audit P1)', () => {
    render(<About />);

    expect(screen.getByText('aboutDescription')).toBeInTheDocument();
    expect(screen.getByText('aboutDescription2')).toBeInTheDocument();
    expect(screen.getByText('aboutDescription3')).toBeInTheDocument();
  });

  it('renders the stack badges from the shared PROFILE_STACK', () => {
    render(<About />);

    const badges = screen.getByTestId('about-stack');
    for (const tech of ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']) {
      expect(within(badges).getByText(tech)).toBeInTheDocument();
    }
  });

  it('renders the translatable stats row (data-backed, i18n keys)', () => {
    render(<About />);

    const stats = screen.getByTestId('about-stats');
    expect(stats).toHaveTextContent('aboutStatYears');
    expect(stats).toHaveTextContent('aboutStatProjects');
    expect(stats).toHaveTextContent('aboutStatUsers');
    expect(stats).toHaveTextContent('aboutStatRemote');
    // Decorative separators are hidden from assistive tech.
    expect(stats.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it('no longer renders the AvatarAbout avatar', () => {
    render(<About />);

    // AvatarAbout received alt={fullName}; the portrait is decorative (alt="").
    expect(screen.queryAllByAltText(DEVELOPER_DATA.fullName)).toHaveLength(0);
  });
});
