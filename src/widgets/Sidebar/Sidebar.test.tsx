import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import styles from './Sidebar.module.scss';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));
vi.mock('./hooks/useSidebar', () => ({
  useSidebar: () => ({
    isOpen: true,
    isHoverExpanded: false,
    toggleSidebar: () => {},
    handleMouseEnter: () => {},
    handleMouseLeave: () => {},
  }),
}));
vi.mock('./hooks/useNavigation', () => ({
  useNavigation: () => ({
    activeSection: '#home',
    mobileMenuOpen: false,
    setMobileMenuOpen: () => {},
    handleNavClick: () => {},
    handleDesktopKeyDown: () => {},
  }),
}));
vi.mock('@/features/ThemeSwitch', () => ({ ThemeSwitch: () => null }));
vi.mock('@/features/LanguageSwitch', () => ({ LanguageSwitch: () => null }));
vi.mock('./ui/MobileMenu', () => ({ MobileMenu: () => null }));
vi.mock('./ui/SidebarHeader', () => ({ SidebarHeader: () => null }));
vi.mock('./ui/ToggleButton', () => ({ ToggleButton: () => null }));
// Keep the real Navigation → NavItem → Link composition in the test.

describe('Sidebar: skip-link integration (R3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the skip link with href="#main-content"', () => {
    render(<Sidebar />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main-content');
  });

  it('is keyboard-focusable', () => {
    render(<Sidebar />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    skip.focus();
    expect(document.activeElement).toBe(skip);
  });

  it('carries the hidden-until-focus off-screen class (R3/fix 6)', () => {
    render(<Sidebar />);

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    // jsdom does not compute layout from the SCSS module, so we assert the class
    // that carries the off-screen positioning (`position:absolute; top:-100%`
    // until `:focus`). This guards against the class being dropped on migration.
    expect(skip.className).toContain(styles.skipLink);
  });
});
