import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AppRouter } from './AppRouter';
import { routerConfig } from './routerConfig';

// Heavy composed features/widgets are out of scope for this routing test —
// we exercise route wiring, anchor survival and the admin placeholder only.
// Contact is stubbed WITH its section id so the hash target exists in DOM.
vi.mock('@/features/About', () => ({ About: () => null }));
vi.mock('@/features/Contact', () => ({ Contact: () => <section id="contact" /> }));
vi.mock('@/features/MyWork', () => ({ MyWork: () => null }));
vi.mock('@/features/Skills', () => ({ Skills: () => null }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: () => null }));
// Provider-dependent right-side switches — same null-mock style as HomePage.test.
vi.mock('@/features/LanguageSwitch', () => ({ LanguageSwitch: () => null }));
vi.mock('@/features/ThemeSwitch', () => ({ ThemeSwitch: () => null }));

const renderAt = (initialEntry: string) => {
  const router = createMemoryRouter(routerConfig, { initialEntries: [initialEntry] });
  render(<RouterProvider router={router} />);
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
  });

  it('renders the localised admin placeholder at /admin', async () => {
    renderAt('/admin');

    // Lazy route: the module resolves asynchronously on navigation.
    expect(
      await screen.findByRole('heading', { level: 1, name: /admin panel/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/under construction/i)).toBeInTheDocument();
    // Admin route replaces the showcase — no showcase chrome leaks in.
    expect(screen.queryByRole('link', { name: /skip to main content/i })).not.toBeInTheDocument();
  });

  it('redirects unknown paths to /', async () => {
    const router = renderAt('/definitely-missing');

    expect(await screen.findByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('renders through the AppRouter component (browser-history router)', () => {
    render(<AppRouter />);

    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });
});
