import { StoreProvider } from '@/app/providers';
import { ADMIN_AUTH_STORAGE_KEY } from '@/features/AdminAuth';
import { storeReducers } from '@/storeReducers';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminSettings } from '../AdminSettings/AdminSettings';
import { AdminLayout } from './AdminLayout';

// Local index stub: the shell test is page-agnostic — what fills the Outlet
// belongs to DashboardPage's own tests (WU-4), not to the layout contract.
const StubPage: React.FC = () => <div data-testid="admin-stub" />;

// Logout (plan rev. 2026-10-02) navigates to the showcase — the memory
// router needs a real `/` route to land on.
const HomeStub: React.FC = () => <div data-testid="home-stub" />;

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
  { path: '/', Component: HomeStub },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: StubPage },
      { path: 'settings', Component: AdminSettings },
    ],
  },
];

const renderAdmin = () => {
  // No flag on purpose: since the gate removal (rev. 2026-10-02) the shell
  // must render unconditionally — a persisted flag is no longer required.
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  const router = createMemoryRouter(routes, { initialEntries: ['/admin'] });
  render(
    <StoreProvider reducers={storeReducers}>
      <RouterProvider router={router} />
    </StoreProvider>
  );
  return router;
};

afterEach(() => {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
});

describe('Admin entry (AdminGate removed — plan rev. 2026-10-02)', () => {
  it('renders the shell even when no auth flag was ever persisted', () => {
    renderAdmin();

    expect(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    // No login panel may ever replace the shell again.
    expect(screen.queryByTestId('admin-gate')).not.toBeInTheDocument();
  });

  it('logout clears the persisted flag and returns to the showcase', async () => {
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
    const router = renderAdmin();

    fireEvent.click(screen.getByRole('button', { name: 'adminLogout' }));

    expect(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)).toBeNull();
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByTestId('home-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-layout')).not.toBeInTheDocument();
  });
});

describe('AdminLayout (WU-3: header, sidebar, outlet)', () => {
  it('renders the admin shell: back link, sidebar nav and the dashboard outlet', () => {
    renderAdmin();

    const backLink = screen.getByTestId('admin-back-to-site');
    expect(backLink).toHaveAttribute('href', '/');
    // Identity t: the KEY must render — a hardcoded literal would fail here.
    expect(backLink).toHaveTextContent('adminBackToSite');

    expect(screen.getByRole('navigation', { name: 'adminNavLabel' })).toBeInTheDocument();
    expect(screen.getByTestId('admin-stub')).toBeInTheDocument();
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
    expect(screen.queryByTestId('admin-stub')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'adminNavDashboard' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'));
    expect(screen.getByTestId('admin-stub')).toBeInTheDocument();
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
