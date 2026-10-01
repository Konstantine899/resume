import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';
import { AdminRoutes } from './AdminRoutes';
import { AdminSettings } from './AdminSettings';

// Deterministic spies shared by the mock factories below (vi.mock is hoisted
// above regular imports/consts — vi.hoisted keeps the references valid).
const spies = vi.hoisted(() => ({
  setLanguage: vi.fn(),
  toggleTheme: vi.fn(),
}));

// Identity i18n: t(key) => key — every assertion then proves the i18n KEY was
// rendered, never a hardcoded literal (i18n-first; same pattern as
// NavControls.test.tsx / Nav.test.tsx). Covers AdminLayout AND its children.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: spies.setLanguage,
    toggleLanguage: vi.fn(),
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

// ThemeSwitch without a ThemeProvider — hook-level spy (icon-adoption.test.tsx
// pattern): the layout test proves the header wires the switch, while the
// flip mechanics stay covered by ThemeContext/useThemeSwitch's own tests.
vi.mock('@/features/ThemeSwitch/hooks/useThemeSwitch', () => ({
  useThemeSwitch: () => ({
    theme: 'dark',
    toggleTheme: spies.toggleTheme,
    isTransitioning: false,
  }),
}));

// Local memory router over the REAL layout + page components (static
// children — lazy loading of the prod config is asserted in AppRouter.test).
const routes = [
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminRoutes },
      { path: 'settings', Component: AdminSettings },
    ],
  },
];

const renderAdmin = () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/admin'] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('AdminLayout (WU-3: header, sidebar, outlet)', () => {
  it('renders the admin shell: back link, sidebar nav and the dashboard outlet', () => {
    renderAdmin();

    const backLink = screen.getByTestId('admin-back-to-site');
    expect(backLink).toHaveAttribute('href', '/');
    // Identity t: the KEY must render — a hardcoded literal would fail here.
    expect(backLink).toHaveTextContent('adminBackToSite');

    expect(screen.getByRole('navigation', { name: 'adminNavLabel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'navAdmin' })).toBeInTheDocument();
    expect(screen.getByText('adminComingSoon')).toBeInTheDocument();
    // Both switches are reused in the header (reuse-first: features, not forks).
    expect(screen.getByTestId('language-switch')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
  });

  it('swaps the Outlet when sidebar nav items are clicked', async () => {
    const router = renderAdmin();

    fireEvent.click(screen.getByRole('link', { name: 'adminNavSettings' }));

    expect(router.state.location.pathname).toBe('/admin/settings');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'adminSettings' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'navAdmin' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'adminNavDashboard' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'));
    expect(screen.getByRole('heading', { level: 1, name: 'navAdmin' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'adminSettings' })).not.toBeInTheDocument();
  });

  it('toggles the theme from the admin header', async () => {
    renderAdmin();

    fireEvent.click(screen.getByTestId('theme-switch'));

    await waitFor(() => expect(spies.toggleTheme).toHaveBeenCalledTimes(1));
  });

  it('switches the language from the admin header', async () => {
    renderAdmin();

    fireEvent.click(screen.getByTestId('language-switch'));

    await waitFor(() => expect(spies.setLanguage).toHaveBeenCalledWith('ru'));
  });

  it('returns to the showcase via the header back link', async () => {
    const router = renderAdmin();

    fireEvent.click(screen.getByTestId('admin-back-to-site'));

    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
