import { render, screen } from '@testing-library/react';
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

  it('uses the developer full name as the heading instead of the "About" label', () => {
    render(<About />);

    expect(
      screen.getByRole('heading', { level: 3, name: DEVELOPER_DATA.fullName })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'about' })).not.toBeInTheDocument();
  });

  it('renders the translated description and CTA via i18n keys', () => {
    render(<About />);

    expect(screen.getByText('aboutDescription')).toBeInTheDocument();
    expect(screen.getByText('getInTouch')).toBeInTheDocument();
  });

  it('no longer renders the AvatarAbout avatar', () => {
    render(<About />);

    // AvatarAbout received alt={fullName}; the portrait is decorative (alt="").
    expect(screen.queryAllByAltText(DEVELOPER_DATA.fullName)).toHaveLength(0);
  });
});
