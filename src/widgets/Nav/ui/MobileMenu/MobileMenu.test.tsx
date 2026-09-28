// ============================================
// Nav Widget - MobileMenu slide-in panel (T6, decisions R4/R9/R10/R11)
// ============================================
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_HREF, NAV_ITEMS } from '../../model/constants';
import { MobileMenu } from './MobileMenu';

// Identity i18n: t(key) => key — assertions prove the i18n KEY was used,
// never a hardcoded literal (same pattern as Nav.test.tsx / NavControls.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
// useThemeSwitch → deterministic 'dark' theme (no ThemeProvider needed);
// the switch COMPONENTS stay un-mocked so the panel's real switch rows are
// observable through their testids (NavControls wiring, T4/T6).
vi.mock('@/features/ThemeSwitch/hooks/useThemeSwitch', () => ({
  useThemeSwitch: () => ({ theme: 'dark', toggleTheme: vi.fn(), isTransitioning: false }),
}));

describe('MobileMenu: slide-in panel (T6, R4/R9/R11)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes an i18n-labelled modal dialog when open and removes it from the a11y tree when closed', () => {
    const { rerender } = render(<MobileMenu open={false} onClose={vi.fn()} />);
    // Closed → the dialog must not be discoverable by role queries.
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(<MobileMenu open={true} onClose={vi.fn()} />);
    // Accessible name comes from t('navMenuLabel') — i18n-first, no literal.
    const dialog = screen.getByRole('dialog', { name: 'navMenuLabel' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-hidden', 'false');
  });

  it('moves focus to the FIRST panel item on open (old Sidebar parity)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    const firstItem = within(dialog).getAllByRole('link')[0];
    expect(firstItem).toBeDefined();
    expect(firstItem).toHaveFocus();
  });

  it('closes on Escape — forwards onClose to the hook (R11)', () => {
    const onClose = vi.fn();
    render(<MobileMenu open onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked (old MobileMenu parity)', () => {
    const onClose = vi.fn();
    render(<MobileMenu open onClose={onClose} />);

    fireEvent.click(screen.getByTestId('overlay'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab: from the LAST item it wraps to the FIRST (R11)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');

    const links = within(dialog).getAllByRole('link');
    const first = links[0];
    const last = links[links.length - 1];
    expect(links).toHaveLength(NAV_ITEMS.length + 1); // 6 sections + 🔐 AdminLink

    last?.focus();
    expect(last).toHaveFocus();

    fireEvent.keyDown(last as HTMLElement, { key: 'Tab' });
    expect(first).toHaveFocus();
  });

  it('traps Shift+Tab: from the FIRST item it wraps to the LAST (R11)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');

    const links = within(dialog).getAllByRole('link');
    const first = links[0];
    const last = links[links.length - 1];

    first?.focus();
    expect(first).toHaveFocus();

    fireEvent.keyDown(first as HTMLElement, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('adds NO second navigation landmark — sections are a plain <ul> (R9/R10)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');

    // The ONE role="navigation lives on Nav's own <nav> — never duplicated here.
    expect(within(dialog).queryByRole('navigation')).toBeNull();

    const sectionList = within(dialog).getByRole('list');
    const sectionLinks = within(sectionList).getAllByRole('link');
    expect(sectionLinks).toHaveLength(NAV_ITEMS.length);
    // R10: every mobile row keeps plain link semantics, never `menuitem`.
    sectionLinks.forEach((link) => {
      expect(link).toHaveAttribute('role', 'link');
    });
  });

  it('renders the switch rows + 🔐, but NO CTA inside the panel (R4/R5)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByTestId('language-switch')).toBeInTheDocument();
    expect(within(dialog).getByTestId('theme-switch')).toBeInTheDocument();
    expect(within(dialog).getByTestId('nav-admin-link')).toHaveAttribute('href', ADMIN_HREF);

    // R4: the resume CTA stays in the header — never inside the panel.
    expect(within(dialog).queryByTestId('nav-cta')).toBeNull();
    expect(within(dialog).queryByTestId('nav-cta-mobile')).toBeNull();
  });

  it('marks the active section and forwards activation through onNavigate (R8)', () => {
    const onNavigate = vi.fn();
    render(<MobileMenu open onClose={vi.fn()} onNavigate={onNavigate} activeSection="about" />);

    const active = screen.getByRole('link', { name: 'about' });
    expect(active).toHaveAttribute('aria-current', 'page');

    fireEvent.click(active);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('#about');

    // Non-active rows stay unmarked.
    expect(screen.getByRole('link', { name: 'home' })).not.toHaveAttribute('aria-current');
  });

  it('tolerates a section click when onNavigate is not wired (optional prop)', () => {
    render(<MobileMenu open onClose={vi.fn()} />);

    // No callback → activation is a no-op here; the panel must survive it.
    fireEvent.click(screen.getByRole('link', { name: 'skills' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'skills' })).toBeInTheDocument();
  });

  it('elevates the panel with the --z-sidebar token (source guard, z-index plan)', () => {
    const scss = readFileSync(resolve(__dirname, './MobileMenu.module.scss'), 'utf8');
    expect(scss).toContain('var(--z-sidebar)');
    // Mobile-only: the panel is hidden at the 768px desktop breakpoint.
    expect(scss).toMatch(/@include md\s*{[^}]*display:\s*none/);
  });
});
