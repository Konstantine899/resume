import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AboutContent } from '@/entities/AboutContent';
import { DEVELOPER_DATA } from '@/entities/Developer';
import { About } from './About';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  // `language` is what the store branch indexes content by (About.tsx line
  // 29); the 9 fallback cases never touch it, WU-4's store case does.
  useLanguage: () => ({ t: (key: string) => key, language: 'ru' }),
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

  it('uses the developer full name as the heading instead of the "About" label', () => {
    render(<About />);

    // level 1: this heading is the page's document outline now (Hero was
    // removed; review fix promoted the silent level-3 to the h1).
    expect(
      screen.getByRole('heading', { level: 1, name: DEVELOPER_DATA.fullName })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'about' })).not.toBeInTheDocument();
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

// WU-4: the store branch. The 9 cases above stay on the fallback (no prop);
// this case proves the chain's second half — HomePage proves store → prop
// (WU-2 provodka tests), this proves prop → DOM, together = "витрина читает
// стор". Content is a hand-built contract literal: features/About may import
// types from entities, never seed/storage from features/AdminAbout.
describe('About: store-content branch (WU-4)', () => {
  const storeContent: AboutContent = {
    fullName: 'STORE_H1_FULL_NAME',
    descriptions: [
      { en: 'store p1 en', ru: 'STORE_PARAGRAPH_ONE_RU' },
      { en: 'store p2 en', ru: 'STORE_PARAGRAPH_TWO_RU' },
      { en: 'store p3 en', ru: 'STORE_PARAGRAPH_THREE_RU' },
    ],
    stats: {
      aboutStatYears: { en: 'store years en', ru: 'STORE_STAT_YEARS_RU' },
      aboutStatProjects: { en: 'store proj en', ru: 'STORE_STAT_PROJECTS_RU' },
      aboutStatUsers: { en: 'store users en', ru: 'STORE_STAT_USERS_RU' },
      aboutStatRemote: { en: 'store remote en', ru: 'STORE_STAT_REMOTE_RU' },
    },
    ctaLabel: { en: 'store cta en', ru: 'STORE_CTA_RU' },
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders every editable value from the content prop instead of i18n keys', () => {
    render(<About content={storeContent} />);

    // h1 — single source with the store (fullName is not localized).
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('STORE_H1_FULL_NAME');

    // Three paragraphs, indexed by language === 'ru'.
    expect(screen.getByText('STORE_PARAGRAPH_ONE_RU')).toBeInTheDocument();
    expect(screen.getByText('STORE_PARAGRAPH_TWO_RU')).toBeInTheDocument();
    expect(screen.getByText('STORE_PARAGRAPH_THREE_RU')).toBeInTheDocument();

    // Four stats.
    const stats = screen.getByTestId('about-stats');
    for (const value of [
      'STORE_STAT_YEARS_RU',
      'STORE_STAT_PROJECTS_RU',
      'STORE_STAT_USERS_RU',
      'STORE_STAT_REMOTE_RU',
    ]) {
      expect(within(stats).getByText(value)).toBeInTheDocument();
    }

    // CTA keeps the #contact contract with the store label.
    const cta = screen.getByRole('link', { name: 'STORE_CTA_RU' });
    expect(cta).toHaveAttribute('href', '#contact');

    // The i18n fallback branch did NOT run (key would be rendered as text).
    expect(screen.queryByText('aboutDescription')).toBeNull();
    expect(screen.queryByText('aboutStatYears')).toBeNull();
    expect(screen.queryByText('getInTouch')).toBeNull();
  });
});
