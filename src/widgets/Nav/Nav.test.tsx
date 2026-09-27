import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '@/pages/Home';
import { ADMIN_HREF, CTA_HREF, NAV_ITEMS } from './model/constants';
import { Nav } from './index';
import styles from './Nav.module.scss';

// Deterministic labels: t(key) => key (same pattern as Sidebar.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
// useThemeSwitch → deterministic 'dark' theme (icon-adoption.test.tsx pattern,
// no ThemeProvider needed). The switch COMPONENTS stay un-mocked so the
// Nav → NavControls wiring (T4) is observable through their real testids.
vi.mock('@/features/ThemeSwitch/hooks/useThemeSwitch', () => ({
  useThemeSwitch: () => ({ theme: 'dark', toggleTheme: vi.fn(), isTransitioning: false }),
}));
// Heavy composed sections are out of scope — we exercise the Nav integration only.
vi.mock('@/features/About', () => ({ About: () => null }));
vi.mock('@/features/Contact', () => ({ Contact: () => null }));
vi.mock('@/features/Hero', () => ({ Hero: () => null }));
vi.mock('@/features/MyWork', () => ({ MyWork: () => null }));
vi.mock('@/features/Skills', () => ({ Skills: () => null }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: () => null }));
vi.mock('@/widgets/Sidebar', () => ({ Sidebar: () => null }));

const EXPECTED_ANCHORS = ['#home', '#work', '#experience', '#about', '#skills', '#contact'];

describe('Nav: sticky top bar scaffold (T1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a semantic header carrying the sticky top-bar styles', () => {
    render(<Nav />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    // jsdom does not compute layout from the SCSS module — guard the class that
    // carries `position: sticky; top: 0; z-index: var(--z-nav)`.
    expect(header.className).toContain(styles.header);
    expect(header).toHaveAttribute('data-testid', 'nav');
  });

  it('declares position: sticky with the --z-nav token (source-level guard)', () => {
    // jsdom cannot verify real stickiness — assert the stylesheets themselves.
    const scss = readFileSync(resolve(__dirname, './Nav.module.scss'), 'utf8');
    expect(scss).toMatch(/position:\s*sticky/);
    expect(scss).toContain('var(--z-nav)');

    const theme = readFileSync(
      resolve(__dirname, '../../shared/styles/globals/_theme.scss'),
      'utf8'
    );
    expect(theme).toMatch(/--z-nav:\s*2000/);
  });

  it('renders exactly the 6 section anchors from NAV_ITEMS', () => {
    render(<Nav />);

    const nav = screen.getByRole('navigation');
    // Section anchors live in the <ul> — the right-side controls (T5 CTA +
    // AdminLink) render additional links outside the list (decision R5).
    const sectionList = within(nav).getByRole('list');
    const links = within(sectionList).getAllByRole('link');

    expect(links).toHaveLength(6);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(EXPECTED_ANCHORS);
    NAV_ITEMS.forEach((item, index) => {
      expect(links[index]).toHaveAttribute('href', item.href);
      // t is mocked to the identity — the label carries the i18n key, never a literal.
      expect(links[index]).toHaveTextContent(item.labelKey);
    });
  });

  it('exposes the placeholder constants for later tasks (T4/T5)', () => {
    expect(NAV_ITEMS).toHaveLength(6);
    expect(ADMIN_HREF).toBe('#/admin');
    expect(CTA_HREF).toBe('#contact');
  });

  it('renders NavControls with both switches inside the right-side container (T4)', () => {
    render(<Nav />);

    const controls = screen.getByTestId('nav-controls');
    expect(within(controls).getByTestId('language-switch')).toBeInTheDocument();
    expect(within(controls).getByTestId('theme-switch')).toBeInTheDocument();
  });

  it('renders CTA then AdminLink after the switches inside nav-controls (T5, R5)', () => {
    render(<Nav />);

    const controls = screen.getByTestId('nav-controls');
    const links = within(controls).getAllByRole('link');

    // Right-side order (decision R5): [🌍🎨 switches][📄 CTA][🔐 AdminLink].
    expect(links.map((link) => link.getAttribute('href'))).toEqual([CTA_HREF, ADMIN_HREF]);

    // Switches precede the CTA in document order.
    const switches = within(controls).getByTestId('nav-controls-switches');
    expect(
      switches.compareDocumentPosition(links[0] as Node) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('invokes onNavigation with the section href when a link is activated', () => {
    const onNavigation = vi.fn();
    render(<Nav onNavigation={onNavigation} />);

    const links = within(screen.getByRole('navigation')).getAllByRole('link');
    fireEvent.click(links[0] as HTMLElement);

    expect(onNavigation).toHaveBeenCalledWith('#home');
  });

  it('marks the active section link with aria-current="page" (Sidebar convention)', () => {
    render(<Nav />);

    const links = within(screen.getByRole('navigation')).getAllByRole('link');

    // Initial active section is the first NAV_ITEMS anchor.
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(links[1]).not.toHaveAttribute('aria-current');
    expect(links[5]).not.toHaveAttribute('aria-current');
  });

  it('moves aria-current immediately when a section link is clicked (T2 hook)', () => {
    const onNavigation = vi.fn();
    render(<Nav onNavigation={onNavigation} />);

    const links = within(screen.getByRole('navigation')).getAllByRole('link');
    const aboutLink = links.find((link) => link.getAttribute('href') === '#about');
    expect(aboutLink).toBeDefined();

    fireEvent.click(aboutLink as HTMLElement);

    expect(aboutLink).toHaveAttribute('aria-current', 'page');
    expect(links[0]).not.toHaveAttribute('aria-current');
    expect(onNavigation).toHaveBeenCalledWith('#about');
  });

  it('does NOT render its own skip link (decision R6)', () => {
    render(<Nav />);

    expect(screen.queryByRole('link', { name: /skip to main content/i })).toBeNull();
  });
});

describe('Nav: renders within HomePage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the sticky Nav before <main> with exactly one skip link', () => {
    render(<HomePage />);

    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');

    // Nav precedes main in document order.
    expect(header.compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    // R6/T6: exactly one skip link, kept in HomePage — Nav adds no duplicate.
    expect(screen.getAllByRole('link', { name: /skip to main content/i })).toHaveLength(1);

    // The 6 section anchors are rendered inside the Nav bar's <ul>
    // (the right-side CTA/AdminLink links from T5 sit outside the list).
    const sectionList = within(header).getByRole('list');
    const navLinks = within(sectionList).getAllByRole('link');
    expect(navLinks).toHaveLength(6);
    expect(navLinks.map((link) => link.getAttribute('href'))).toEqual(EXPECTED_ANCHORS);

    // Main content structure is untouched.
    expect(main).toHaveAttribute('id', 'main-content');
  });
});
