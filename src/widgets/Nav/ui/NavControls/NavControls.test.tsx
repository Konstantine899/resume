// ============================================
// NavControls — language + theme switch pair (T4, decisions R5 / R12)
// ============================================
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageSwitch } from '@/features/LanguageSwitch';
import { ThemeSwitch } from '@/features/ThemeSwitch';
import type { NavControlsProps } from '../../model/types';
import { NavControls } from './NavControls';

// Deterministic spies — created via vi.hoisted so BOTH the vi.mock factories
// below and the assertions share the same instances (vi.mock is hoisted above
// regular imports/consts).
const spies = vi.hoisted(() => ({
  setLanguage: vi.fn(),
  toggleTheme: vi.fn(),
}));

// Identity i18n: t(key) => key — assertions then prove the i18n KEY was
// rendered, never a hardcoded literal (i18n-first; same pattern as
// Nav.test.tsx / NavItem.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: spies.setLanguage,
    toggleLanguage: vi.fn(),
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

// useThemeSwitch → deterministic 'dark' theme + captured toggleTheme
// (icon-adoption.test.tsx pattern — no ThemeProvider needed in unit tests).
vi.mock('@/features/ThemeSwitch/hooks/useThemeSwitch', () => ({
  useThemeSwitch: () => ({
    theme: 'dark',
    toggleTheme: spies.toggleTheme,
    isTransitioning: false,
  }),
}));

describe('NavControls: 🌍 + 🎨 switch pair (T4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the language switch BEFORE the theme switch (R5 order)', () => {
    render(<NavControls />);

    const buttons = within(screen.getByTestId('nav-controls-switches')).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveAttribute('data-testid', 'language-switch');
    expect(buttons[1]).toHaveAttribute('data-testid', 'theme-switch');
  });

  it('renders desktop switches as icon-only buttons with built-in title tooltips (R5)', () => {
    render(<NavControls />);

    const languageButton = screen.getByTestId('language-switch');
    const themeButton = screen.getByTestId('theme-switch');
    // Icon-only → the switch's native `title` is the tooltip (the same
    // mechanism the old Sidebar used in its collapsed state), resolved
    // through the identity-mocked t().
    expect(languageButton).toHaveAttribute('title', 'language');
    expect(themeButton).toHaveAttribute('title', 'lightMode');
    // …and no visible label text — R5 keeps CTA (T5) as the only text control.
    expect(languageButton).not.toHaveTextContent('languageFull');
    expect(themeButton).not.toHaveTextContent('darkMode');
  });

  it('toggles the language on click (🌍 functional)', () => {
    render(<NavControls />);

    fireEvent.click(screen.getByTestId('language-switch'));

    // language is 'en' in the mock → the switch must request 'ru'.
    expect(spies.setLanguage).toHaveBeenCalledTimes(1);
    expect(spies.setLanguage).toHaveBeenCalledWith('ru');
  });

  it('toggles the theme on click (🎨 functional)', () => {
    render(<NavControls />);

    fireEvent.click(screen.getByTestId('theme-switch'));

    expect(spies.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders variant="mobile" as full text rows (old MobileMenu composition, T6)', () => {
    render(<NavControls variant="mobile" />);

    const languageButton = screen.getByTestId('language-switch');
    const themeButton = screen.getByTestId('theme-switch');
    // Text rows → the i18n keys are visible, no icon-only tooltip (mirrors
    // how the old Sidebar MobileMenu rendered `variant="mobile"`).
    expect(languageButton).toHaveTextContent('languageFull');
    expect(themeButton).toHaveTextContent('darkMode');
    expect(languageButton).not.toHaveAttribute('title');
    expect(themeButton).not.toHaveAttribute('title');
  });
});

describe('NavControlsProps ↔ REAL switch component props (R12)', () => {
  it('compiles NavControlsProps against the real ThemeSwitch/LanguageSwitch contracts', () => {
    // The return-type annotations ARE the assertion: if NavControlsProps
    // drifts from a REAL component contract — the exact class of regression
    // the stale Sidebar `ThemeSwitchProps` (missing isCollapsed/variant)
    // caused — `tsc --noEmit` rejects these functions. The stale type is
    // never imported here by design.
    const acceptsNavControlsProps = {
      theme: (props: NavControlsProps): Parameters<typeof ThemeSwitch>[0] => props,
      language: (props: NavControlsProps): Parameters<typeof LanguageSwitch>[0] => props,
    };

    const sample: NavControlsProps = { variant: 'mobile', className: 'row', 'data-testid': 'x' };
    expect(acceptsNavControlsProps.theme(sample)).toEqual(sample);
    expect(acceptsNavControlsProps.language(sample)).toEqual(sample);
  });
});
