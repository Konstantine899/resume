// ============================================================
// Icon Adoption — RED size-guard aggregation test
// ============================================================
// Change: icon-adoption (pr-4) · Gate: 17 raw <LucideIcon> sites
// migrated to <Icon name size color="inherit" decorative />.
//
// Each migrated site renders an inert <span class="icon"> wrapper
// (data-size, data-color, data-interactive, aria-hidden) around the
// inner <svg> whose PRESENTATION size is driven by the inline style
// injected by <Icon> (NOT the svg width/height 24px lucide default).
//
// These tests guard the pixel boxes per group and, critically, the
// ANTI-REGRESSION invariants against the Button/Input conduit
// ICON_SIZE_MAP (IconButton lg -> 24, md -> 20, Button md -> 20):
// once a site omits its explicit `size`, the conduit injects the
// conduit px via cloneElement and the inline Icon style wins over the
// consumer SCSS box => regression. `explicit size == CSS box` is the
// contract enforced below.
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Mail } from 'lucide-react';

// ---- Icon containers / migrated sites ----
import { ModalCloseButton } from '@/shared/ui/Modal';
import { Toast } from '@/shared/ui/Toast';
import { TOAST_ICONS, TOAST_TYPES } from '@/shared/ui/Toast';
import { Input, InputEmail, InputPhone, InputSearch } from '@/shared/ui/Input';
import { Nav, NAV_ITEMS } from '@/widgets/Nav';
import { ContactCard } from '@/shared/ui/Card';
import { ThemeSwitch } from '@/features/ThemeSwitch';
import { LanguageSwitch } from '@/features/LanguageSwitch';
import { Icon } from '@/shared/ui/Icon';

// ============================================================
// Mocks (existing repo pattern — Nav.test, Contact.test,
// Hero.test). These keep provider-dependent slices deterministic
// WITHOUT touching the migrated <Icon> DOM the suite asserts on.
// ============================================================

// useLanguage → passthrough `t` (i18n smoke); keeps ThemeSwitch/
// LanguageSwitch/Nav/MobileMenu renderable in jsdom.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ language: 'en', t: (key: string) => key }),
}));

// useThemeSwitch → deterministic `dark` theme (no ThemeProvider needed).
vi.mock('@/features/ThemeSwitch/hooks/useThemeSwitch', () => ({
  useThemeSwitch: () => ({ theme: 'dark', toggleTheme: () => {}, isTransitioning: false }),
}));

// Nav uses the REAL useNavigation (same wiring as Nav.test.tsx): it is
// jsdom-safe (IntersectionObserver is feature-guarded; burger auto-close
// only fires on resize events, so the panel opens stably). The old
// Sidebar useSidebar/useNavigation hook mocks are gone with the widget (R13).

// ============================================================
// Helpers
// ============================================================

/** Resolve the inner <svg> of a migrated <Icon> within `root`. */
function iconSvg(root: ParentNode): SVGSVGElement {
  const svg = root.querySelector('svg');
  if (!svg) {
    throw new Error('expected an <svg> inside the migrated <Icon>');
  }
  return svg as SVGSVGElement;
}

/** Assert the transparent pixel box the Icon injects (inline style). */
function assertIconSize(root: ParentNode, px: number): void {
  expect(iconSvg(root)).toHaveStyle({ width: `${px}px`, height: `${px}px` });
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// Modal / Toast group
// ============================================================
describe('icon-adoption: Modal/Toast size guards', () => {
  it('ModalCloseButton default X renders a 20px inner svg', () => {
    const { container } = render(<ModalCloseButton onClose={vi.fn()} />);
    const button = container.querySelector('button') as HTMLButtonElement;
    assertIconSize(button, 20);
  });

  it.each([...TOAST_TYPES])(
    'Toast type-icon (%s) renders a 20px svg (TOAST_ICONS[type])',
    (type) => {
      const { container } = render(
        <Toast id={`t-${type}`} message="m" type={type} onClose={vi.fn()} />
      );
      // First svg in the toast = the type icon (before close/pause).
      const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;
      assertIconSize(toast, 20);
    }
  );

  it('Toast close button renders a 16px svg', () => {
    render(<Toast id="t" message="m" onClose={vi.fn()} />);
    assertIconSize(screen.getByTestId('toast-close'), 16);
  });

  it('Toast pause indicator renders a 12px svg on hover-pause', () => {
    const { container } = render(<Toast id="t" message="m" duration={5000} onClose={vi.fn()} />);
    fireEvent.mouseEnter(screen.getByTestId('toast'));
    const svgs = container.querySelectorAll('[data-testid="toast"] svg');
    expect(svgs.length).toBe(3); // type + close + pause
    expect(svgs[2]).toHaveStyle({ width: '12px', height: '12px' });
  });
});

// ============================================================
// Input group
// ============================================================
describe('icon-adoption: Input size guards', () => {
  // issue #53 finding: magic size={18} in Email/Phone bypassed
  // inferIconSize — dropped, so all three input types infer 20 at md.
  it('InputEmail renders a 20px svg via inferIconSize, no explicit size', () => {
    const { container } = render(<InputEmail />);
    assertIconSize(container, 20);
  });

  it('InputPhone renders a 20px svg via inferIconSize, no explicit size', () => {
    const { container } = render(<InputPhone />);
    assertIconSize(container, 20);
  });

  it('InputSearch (md) renders a 20px svg via inferIconSize, no explicit size', () => {
    const { container } = render(<InputSearch />);
    assertIconSize(container, 20);
  });

  it('Input password toggle button renders a 16px Eye/EyeOff svg', () => {
    const { container } = render(<Input type="password" showPasswordToggle />);
    const toggleButton = container.querySelector('button[aria-label="Show password"]');
    expect(toggleButton).not.toBeNull();
    assertIconSize(toggleButton as HTMLElement, 16);
  });
});

// ============================================================
// Nav widget group (migrated from the old Sidebar group, T7)
// ============================================================
describe('icon-adoption: Nav widget size guards', () => {
  it('Nav burger menu button renders a 20px svg, NOT 24 (lg conduit anti-regression)', () => {
    render(<Nav />);
    const menuButton = screen.getByTestId('nav-burger');
    expect(menuButton).not.toBeNull();
    assertIconSize(menuButton, 20);
    expect(iconSvg(menuButton).style.width).not.toBe('24px');
  });

  it('Nav burger close state (X) renders a 20px svg while the menu panel is open', () => {
    // Nav's MobileMenu panel has NO close button (R4 — no header/footer in
    // the panel); the close affordance moved to the burger, so the old
    // MobileMenu close-button guard maps to the open-state ✕ icon.
    render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'navMenuOpen' }));

    expect(screen.getByRole('dialog', { name: 'navMenuLabel' })).toBeInTheDocument();
    const closeBurger = screen.getByRole('button', { name: 'navMenuClose' });
    assertIconSize(closeBurger, 20);
  });

  it('burger toggle (ToggleButton port) keeps an explicit 20px svg in both states', () => {
    // R13 removed the Sidebar collapsed state and its ToggleButton chevron —
    // the toggle role now belongs to the burger, so guard both Menu/✕ states
    // plus the aria-expanded flip instead of the dead `expandSidebar` label.
    render(<Nav />);

    const closed = screen.getByRole('button', { name: 'navMenuOpen' });
    expect(closed).toHaveAttribute('aria-expanded', 'false');
    assertIconSize(closed, 20);

    fireEvent.click(closed);
    const opened = screen.getByRole('button', { name: 'navMenuClose' });
    expect(opened).toHaveAttribute('aria-expanded', 'true');
    assertIconSize(opened, 20);

    fireEvent.click(opened);
    const reclosed = screen.getByRole('button', { name: 'navMenuOpen' });
    expect(reclosed).toHaveAttribute('aria-expanded', 'false');
    assertIconSize(reclosed, 20);
  });

  it('panel NavItem navIcon renders a 16px svg with link semantics (R10)', () => {
    // Size contract moved with the widget: Sidebar NavItem was 20px,
    // Nav's NavItem renders 16px (NavItem.tsx). R10: the mobile row is a
    // regular link — never the orphaned `menuitem` role the old test pinned.
    render(<Nav />);
    fireEvent.click(screen.getByRole('button', { name: 'navMenuOpen' }));

    const dialog = screen.getByRole('dialog', { name: 'navMenuLabel' });
    const links = within(dialog).getAllByRole('link');
    expect(links).toHaveLength(NAV_ITEMS.length + 3); // 6 sections + 3 social links

    const item = links[0] as HTMLElement;
    expect(item).toHaveAttribute('role', 'link');
    expect(item).not.toHaveAttribute('role', 'menuitem');
    assertIconSize(item, 16);
  });
});

// ============================================================
// Features group
// ============================================================
describe('icon-adoption: feature size guards + anti-conduit', () => {
  it('ThemeSwitch controlIcon renders an 18px svg, NOT 20 (md Button) / 24 (lg)', () => {
    const { container } = render(<ThemeSwitch />);
    assertIconSize(container, 18);
    expect(iconSvg(container).style.width).not.toBe('20px');
    expect(iconSvg(container).style.width).not.toBe('24px');
  });

  it('LanguageSwitch Globe renders an 18px svg, NOT 20 (md Button)', () => {
    const { container } = render(<LanguageSwitch />);
    assertIconSize(container, 18);
    expect(iconSvg(container).style.width).not.toBe('20px');
  });

  it('ContactCard Mail icon renders a 40px svg', () => {
    const { container } = render(
      <ContactCard title="Contact" icon={<Icon name={Mail} size={40} color="inherit" decorative />}>
        <p>text</p>
      </ContactCard>
    );
    assertIconSize(container, 40);
  });
});

// ============================================================
// Wrapper invariant (on representative decorative sites)
// ============================================================
describe('icon-adoption: decorative wrapper contract', () => {
  it('ModalCloseButton wrapper span carries data-color/inactive/no role', () => {
    const { container } = render(<ModalCloseButton onClose={vi.fn()} />);
    const wrapper = container.querySelector('button span') as HTMLSpanElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-color', 'inherit');
    expect(wrapper).toHaveAttribute('data-interactive', 'false');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).not.toHaveAttribute('role');
  });

  it('wrapper span of a decorative Icon carries data-interactive="false" (string)', () => {
    render(<Icon name={Mail} size={20} color="inherit" decorative />);
    const wrapper = document.body.querySelector('span[data-color="inherit"]') as HTMLSpanElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-interactive', 'false');
    expect(wrapper).toHaveAttribute('data-size', '20');
  });
});

// ============================================================
// data-map guards (TOAST_ICONS + NAV_ITEMS)
// ============================================================
describe('icon-adoption: data maps are not mutated across renders', () => {
  it('TOAST_ICONS exposes a stable function per type across a render', () => {
    const keys = [...TOAST_TYPES] as (keyof typeof TOAST_ICONS)[];
    const before = keys.map((k) => TOAST_ICONS[k]);
    render(<Toast id="t" message="m" type="success" onClose={vi.fn()} />);
    const after = keys.map((k) => TOAST_ICONS[k]);

    expect(keys).toHaveLength(4);
    before.forEach((icon, i) => {
      expect(icon).toBeDefined();
      expect(after[i]).toBe(before[i]); // same lucide ref, no mutation
    });
  });

  it('NAV_ITEMS exposes stable icon references across a Nav render', () => {
    const before = NAV_ITEMS.map((item) => item.icon);

    expect(NAV_ITEMS).toHaveLength(6);
    NAV_ITEMS.forEach((item) => expect(item.icon).toBeDefined());

    // Rendering Nav must not mutate the shared data map (single source).
    render(<Nav />);
    expect(NAV_ITEMS.map((item) => item.icon)).toEqual(before);
  });

  it('rendering a migrated site does not mutate the TOAST_ICONS map values', () => {
    const snapshot = { ...TOAST_ICONS };
    render(<Toast id="t" message="m" type="error" onClose={vi.fn()} />);
    (Object.keys(snapshot) as (keyof typeof TOAST_ICONS)[]).forEach((key) => {
      expect(TOAST_ICONS[key]).toBe(snapshot[key]);
    });
  });
});
