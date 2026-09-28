import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Home } from 'lucide-react';
import { NavItem } from './NavItem';
import styles from './NavItem.module.scss';

// Deterministic labels: t(key) => key (same pattern as Sidebar.test.tsx /
// Nav.test.tsx) — assertions then prove the i18n KEY was rendered, never a
// hardcoded literal (i18n-first).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Local fixture (NAV_ITEMS[0] shape) — keeps the test independent of the
// array while still exercising the real `NavItem` model contract.
const HOME_ITEM = { id: 'home', href: '#home', labelKey: 'home', icon: Home };

describe('NavItem: horizontal desktop link (T3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the item icon and the i18n label resolved through t(labelKey)', () => {
    const { container } = render(<NavItem item={HOME_ITEM} variant="desktop" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', HOME_ITEM.href);
    // Identity mock → the text is the i18n key, no hardcoded string.
    expect(link).toHaveTextContent(HOME_ITEM.labelKey);
    // Icon renders as an svg (decorative → aria-hidden, no a11y label leak).
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('sets aria-current="page" only when active', () => {
    const { rerender } = render(<NavItem item={HOME_ITEM} variant="desktop" />);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');

    rerender(<NavItem item={HOME_ITEM} variant="desktop" active />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('invokes onNavigate when the link is activated', () => {
    const onNavigate = vi.fn();
    render(<NavItem item={HOME_ITEM} variant="desktop" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('link'));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('composes the shared Link (ghost variant) with the scoped active class', () => {
    render(<NavItem item={HOME_ITEM} variant="desktop" active />);

    const link = screen.getByRole('link');
    // shared Link integration kept from the old Sidebar NavItem
    expect(link).toHaveAttribute('data-variant', 'ghost');
    expect(link.className).toContain(styles.desktop);
    expect(link.className).toContain(styles.active);
  });

  it('keeps the .desktop.active specificity trick that beats Link.ghost (source guard)', () => {
    // jsdom does not resolve CSS specificity — assert the stylesheet itself,
    // mirroring the old NavItem.module.scss approach (0,3,0 > 0,2,0).
    const scss = readFileSync(resolve(__dirname, './NavItem.module.scss'), 'utf8');
    expect(scss).toMatch(/&\.desktop\.active/);
  });
});

describe('NavItem: mobile variant uses regular link semantics (R10)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders role="link" and NEVER role="menuitem" (R10 regression guard)', () => {
    render(<NavItem item={HOME_ITEM} variant="mobile" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('role', 'link');
    expect(link).not.toHaveAttribute('role', 'menuitem');
  });

  it('renders a full-width row carrying the mobile class (T6 MobileMenu row)', () => {
    render(<NavItem item={HOME_ITEM} variant="mobile" />);

    const link = screen.getByRole('link');
    expect(link.className).toContain(styles.mobile);
    expect(link).toHaveAttribute('href', HOME_ITEM.href);
  });

  it('keeps aria-current and onNavigate behaviour on mobile', () => {
    const onNavigate = vi.fn();
    render(<NavItem item={HOME_ITEM} variant="mobile" active onNavigate={onNavigate} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');

    fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
