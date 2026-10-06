import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { StoreProvider } from '@/app/providers';
import { mockAdminMetrics } from '@/features/AdminDashboard';
import { storeReducers } from '@/storeReducers';
import { AppRouter } from './AppRouter';
import { routerConfig } from './routerConfig';

// Heavy composed features/widgets are out of scope for this routing test —
// we exercise route wiring, anchor survival and the admin dashboard only.
// Contact is stubbed WITH its section id so the hash target exists in DOM.
vi.mock('@/features/About', () => ({ About: () => null }));
vi.mock('@/features/Contact', () => ({ Contact: () => <section id="contact" /> }));
vi.mock('@/features/MyWork', () => ({ MyWork: () => null }));
vi.mock('@/features/Skills', () => ({ Skills: () => null }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: () => null }));
// Provider-dependent right-side switches — same null-mock style as HomePage.test.
vi.mock('@/features/LanguageSwitch', () => ({ LanguageSwitch: () => null }));
vi.mock('@/features/ThemeSwitch', () => ({ ThemeSwitch: () => null }));

// The dashboard route reads Redux — every render goes through the real
// reducer map (src/storeReducers), the same shape App.tsx injects.
const renderAt = (initialEntry: string) => {
  const router = createMemoryRouter(routerConfig, { initialEntries: [initialEntry] });
  render(
    <StoreProvider reducers={storeReducers}>
      <RouterProvider router={router} />
    </StoreProvider>
  );
  return router;
};

describe('AppRouter', () => {
  it('renders the showcase at /', () => {
    renderAt('/');

    // The showcase owns its skip link — proof HomePage is the /-route component.
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    // Nav section anchors survive the router (decision §8.3-B: anchors kept).
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '#contact');
  });

  it('keeps hash anchors working at / (#contact targets the Contact section)', () => {
    const router = renderAt('/#contact');

    // Router does not swallow the hash: pathname stays / and hash is preserved.
    expect(router.state.location.pathname).toBe('/');
    expect(router.state.location.hash).toBe('#contact');
    // Native jump target exists in the DOM (browser handles the scroll).
    expect(document.getElementById('contact')).not.toBeNull();
    // The showcase still rendered — the hash did not navigate away from /.
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('mounts /admin behind a lazy boundary (no admin page chunk on /)', () => {
    // Config-level guarantee that vite code-splits the admin area: the route
    // exposes only `lazy`, never a statically imported Component — visiting
    // `/` must not pull the admin page module into the main bundle (WU-2).
    const adminRoute = routerConfig.find((route) => route.path === '/admin');

    expect(adminRoute?.lazy).toBeTypeOf('function');
    expect(adminRoute?.Component).toBeUndefined();
    // WU-3: the lazy parent is the layout shell; all children (dashboard,
    // settings, about, contact, mywork, skills — About/Contact/Projects/
    // Skills CRUD §10) are lazy too so no admin page reaches the showcase
    // bundle.
    expect(adminRoute?.children).toHaveLength(7);
    expect(adminRoute?.children?.every((child) => child.lazy)).toBe(true);
    // Deep /admin loads hydrate asynchronously — the route carries a fallback
    // so React Router 8 doesn't warn about a missing HydrateFallback.
    expect(adminRoute?.hydrateFallbackElement).toBeDefined();
  });

  it('renders the admin dashboard at /admin', async () => {
    // No flag needed — AdminGate was removed (plan rev. 2026-10-02): the
    // shell renders unconditionally.
    renderAt('/admin');

    // Lazy route: the module resolves asynchronously on navigation (WU-4).
    expect(
      await screen.findByRole('heading', { level: 1, name: /dashboard/i })
    ).toBeInTheDocument();
    // Same typed mock the slice seeds with — proves data flows store → page.
    mockAdminMetrics.forEach((metric) => {
      expect(screen.getByText(String(metric.value))).toBeInTheDocument();
    });
    // Admin route replaces the showcase — no showcase chrome leaks in.
    expect(screen.queryByRole('link', { name: /skip to main content/i })).not.toBeInTheDocument();
    // WU-3: the /admin render goes through the layout shell (header back link).
    expect(screen.getByTestId('admin-back-to-site')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
  });

  it('redirects unknown paths to /', async () => {
    const router = renderAt('/definitely-missing');

    expect(await screen.findByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('renders through the AppRouter component (browser-history router)', () => {
    // HomePage reads the AboutContent slice (WU-2) — same store shape as
    // the renderAt() helper above, so this path needs the Provider too.
    render(
      <StoreProvider reducers={storeReducers}>
        <AppRouter />
      </StoreProvider>
    );

    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });
});
