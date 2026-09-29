// ============================================
// Nav Widget Stories — Desktop / Mobile / Social links
// ============================================
import i18n from '@/shared/lib/i18n/config/i18n';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { Nav } from './Nav';
import { CTA_HREF, MOBILE_MENU_ID, NAV_ITEMS } from './model/constants';

/**
 * Page-like mount: the sticky header above an empty body — the same shape
 * HomePage gives Nav, so `banner`/`navigation` roles read as in the app.
 * Assertions resolve copy through the shared i18n singleton (i18n-first):
 * they hold in any active locale, never against literals.
 */
const renderNav = () => (
  <>
    <Nav />
    <main data-testid="story-main" style={{ minHeight: '100vh' }} />
  </>
);

const meta = {
  title: 'Widgets/Nav',
  component: Nav,
  render: renderNav,
  parameters: {
    layout: 'fullscreen',
    // Desktop is the default mount; MobileBurger overrides it. The viewport
    // addon is NOT installed — @storybook/addon-vitest resolves this
    // parameter itself against MINIMAL_VIEWPORTS before each play function,
    // resizing the real browser page (mobile1 = 320×568, desktop = 1280×1024).
    viewport: { defaultViewport: 'desktop' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Nav>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Desktop
// ============================================
export const Desktop: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // One banner, exactly ONE navigation landmark (decision R9), i18n-named.
    expect(canvas.getByRole('banner')).toBeInTheDocument();
    const navs = canvas.getAllByRole('navigation');
    expect(navs).toHaveLength(1);
    const nav = navs[0] as HTMLElement;
    expect(nav).toHaveAccessibleName(i18n.t('navAriaLabel'));

    // Section list: exactly NAV_ITEMS, in order, with their hrefs + labels.
    const sectionList = within(nav).getByRole('list');
    const sectionLinks = within(sectionList).getAllByRole('link');
    expect(sectionLinks).toHaveLength(NAV_ITEMS.length);
    expect(sectionLinks.map((link) => link.getAttribute('href'))).toEqual(
      NAV_ITEMS.map((item) => item.href)
    );
    for (const item of NAV_ITEMS) {
      expect(within(sectionList).getByRole('link', { name: i18n.t(item.labelKey) })).toBeVisible();
    }

    // First section starts active — NAV_ITEMS-derived default (decision R8).
    const firstSection = sectionLinks[0] as HTMLElement;
    expect(firstSection).toHaveAttribute('aria-current', 'page');

    // Right side (decision R5): 🌍🎨 switches → 📄 CTA → social links
    // (the 🔐 AdminLink is hidden from public surfaces — recruiter audit P0).
    const controls = canvas.getByTestId('nav-controls');
    expect(within(controls).getByTestId('language-switch')).toBeVisible();
    expect(within(controls).getByTestId('theme-switch')).toBeVisible();

    const cta = within(controls).getByTestId('nav-cta');
    expect(cta).toBeVisible();
    expect(cta).toHaveAttribute('href', CTA_HREF);
    expect(cta).toHaveTextContent(i18n.t('getResume'));

    const socials = within(controls).getByTestId('nav-social-links');
    expect(socials).toBeVisible();
    for (const link of SOCIAL_LINKS) {
      const anchor = within(socials).getByRole('link', { name: i18n.t(link.labelKey) });
      expect(anchor).toBeVisible();
      expect(anchor).toHaveAttribute('href', link.href);
    }
    expect(within(controls).queryByTestId('nav-admin-link')).toBeNull();

    // Burger row is hidden at the desktop breakpoint (decision R4).
    expect(canvas.getByTestId('nav-burger')).not.toBeVisible();
    expect(canvas.getByTestId('nav-cta-mobile')).not.toBeVisible();
  },
};

// ============================================
// Mobile — burger toggle + slide-in panel
// ============================================
export const MobileBurger: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Below the breakpoint the burger row replaces links + controls (R4).
    expect(canvas.getByTestId('nav-burger')).toBeVisible();
    expect(canvas.getByTestId('nav-cta-mobile')).toBeVisible();
    expect(canvas.getByTestId('nav-controls')).not.toBeVisible();
    const nav = canvas.getByRole('navigation');
    expect(within(nav).getByRole('list', { hidden: true })).not.toBeVisible();

    const burger = canvas.getByTestId('nav-burger');
    expect(burger).toHaveAccessibleName(i18n.t('navMenuOpen'));
    expect(burger).toHaveAttribute('aria-expanded', 'false');
    expect(burger).toHaveAttribute('aria-controls', MOBILE_MENU_ID);

    // Closed panel is inert — not in the accessibility tree yet.
    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    // Open the menu.
    await userEvent.click(burger);
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName(i18n.t('navMenuLabel'));

    // R9: still exactly ONE navigation landmark while the panel is open.
    expect(canvas.getAllByRole('navigation')).toHaveLength(1);

    // R11: initial focus lands on the first panel row (Home).
    const homeRow = within(dialog).getByRole('link', { name: i18n.t('home') });
    await waitFor(() => expect(homeRow).toHaveFocus());

    // Panel: every section as a plain link (R10) + 🔐 Admin (R4: no CTA).
    for (const item of NAV_ITEMS) {
      expect(within(dialog).getByRole('link', { name: i18n.t(item.labelKey) })).toBeVisible();
    }
    expect(within(dialog).getByTestId('nav-social-links')).toBeVisible();
    expect(within(dialog).queryByTestId('nav-admin-link')).not.toBeInTheDocument();
    expect(within(dialog).queryByTestId('nav-cta')).not.toBeInTheDocument();

    // Burger flips ☰ → ✕ — state reflected in aria.
    expect(burger).toHaveAccessibleName(i18n.t('navMenuClose'));
    expect(burger).toHaveAttribute('aria-expanded', 'true');

    // Escape closes the dialog (R11) and hands focus back to the burger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(burger).toHaveFocus());
  },
};

// ============================================
// Social links — icon-only with i18n accessible names (audit P1)
// ============================================
export const SocialLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const socials = within(canvas.getByTestId('nav-controls')).getByTestId('nav-social-links');

    expect(socials).toBeVisible();
    for (const link of SOCIAL_LINKS) {
      const anchor = within(socials).getByRole('link', { name: i18n.t(link.labelKey) });
      expect(anchor).toBeVisible();
      expect(anchor).toHaveAttribute('href', link.href);
      expect(anchor).toHaveAttribute('target', '_blank');
    }

    // The 🔐 AdminLink is hidden from public surfaces (recruiter audit P0).
    expect(canvas.queryByTestId('nav-admin-link')).toBeNull();
  },
};
