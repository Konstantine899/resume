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
    objectFit,
    size,
    className,
    src,
    alt,
  }: {
    'data-testid'?: string;
    variant?: string;
    objectFit?: string;
    size?: string;
    className?: string;
    src?: string;
    alt?: string;
  }) => (
    <div
      data-testid={dataTestId ?? 'mock-image'}
      data-mock="image"
      data-variant={variant}
      data-object-fit={objectFit}
      data-size={size}
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

  it('renders the portrait via the Avatar portrait variant after the panel in the DOM', () => {
    render(<About />);

    const panel = screen.getByTestId('about-panel');
    const portrait = screen.getByTestId('about-portrait');
    expect(portrait).toHaveAttribute('data-variant', 'portrait');
    // D14: inside Avatar the inner Image keeps the transparent/contain/full
    // mapping that the vitrina used to spell out by hand.
    const image = screen.getByTestId('mock-image');
    expect(image).toHaveAttribute('data-variant', 'transparent');
    expect(image).toHaveAttribute('data-object-fit', 'contain');
    expect(image).toHaveAttribute('data-size', 'full');
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

// WU-11: the dynamic vitrina branches of contract v2 (SPEC D13). The cases
// above pin the default (no prop) DOM identity; these pin the add/delete
// shaped content: extra paragraph, removed stat, hidden CTA, empty array.
// Module scope (WU-14): the portrait suite below reuses the SAME fixture.
const baseContent: AboutContent = {
  fullName: 'Dynamic Full Name',
  descriptions: [
    { en: 'p1 en', ru: 'DYNAMIC_P1_RU' },
    { en: 'p2 en', ru: 'DYNAMIC_P2_RU' },
    { en: 'p3 en', ru: 'DYNAMIC_P3_RU' },
  ],
  stats: {
    aboutStatYears: { en: '5+ years', ru: 'DYNAMIC_YEARS_RU' },
  },
  ctaLabel: { en: 'custom cta', ru: 'DYNAMIC_CTA_RU' },
};

describe('About: dynamic content branches (WU-11)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a 4th paragraph added by the admin', () => {
    const content: AboutContent = {
      ...baseContent,
      descriptions: [...baseContent.descriptions, { en: 'p4 en', ru: 'DYNAMIC_P4_RU' }],
    };

    render(<About content={content} />);

    expect(screen.getByText('DYNAMIC_P4_RU')).toBeInTheDocument();
    expect(screen.getByText('DYNAMIC_P1_RU')).toBeInTheDocument();
  });

  it('hides a stat record the admin deleted', () => {
    render(<About content={baseContent} />);

    const stats = screen.getByTestId('about-stats');
    expect(within(stats).getByText('DYNAMIC_YEARS_RU')).toBeInTheDocument();
    // aboutStatProjects/aboutStatUsers/aboutStatRemote were removed → absent.
    expect(within(stats).queryByText('DYNAMIC_PROJECTS_RU')).toBeNull();
    expect(within(stats).queryByText('aboutStatProjects')).toBeNull();
    expect(within(stats).queryByText('aboutStatUsers')).toBeNull();
    expect(within(stats).queryByText('aboutStatRemote')).toBeNull();
  });

  it('hides the CTA link when ctaLabel is null', () => {
    const content: AboutContent = { ...baseContent, ctaLabel: null };

    render(<About content={content} />);

    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByText('getInTouch')).toBeNull();
  });

  it('does not throw on an empty descriptions array', () => {
    const content: AboutContent = { ...baseContent, descriptions: [] };

    expect(() => render(<About content={content} />)).not.toThrow();
    expect(screen.getByTestId('about-panel')).toBeInTheDocument();
    expect(screen.queryByText('DYNAMIC_P1_RU')).toBeNull();
    // The block renders empty — no hardcoded fallback paragraphs leak in.
    expect(screen.queryByText('aboutDescription')).toBeNull();
  });
});

// WU-14 (SPEC D16): the portrait follows the SAME store-prop contract as the
// other fields — `content.portrait` overrides the static asset, and the
// fallback (no prop, or content without a portrait) keeps the bundled image.
describe('About: portrait source (WU-14, D16)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses content.portrait as the image src when it is set', () => {
    const content: AboutContent = { ...baseContent, portrait: '/images/about/me.png' };

    render(<About content={content} />);

    // The inner Image (mocked) carries the src; the Avatar maps it through.
    expect(screen.getByTestId('mock-image')).toHaveAttribute('data-src', '/images/about/me.png');
    expect(screen.getByTestId('about-portrait')).toHaveAttribute('data-variant', 'portrait');
  });

  it('falls back to the static bundled portrait when content has no portrait', () => {
    render(<About content={baseContent} />);

    const image = screen.getByTestId('mock-image');
    const src = image.getAttribute('data-src') ?? '';
    expect(src).not.toBe('/images/about/me.png');
    // The bundled static asset (not an admin path) is used.
    expect(src).toMatch(/\.webp$/);
  });
});
