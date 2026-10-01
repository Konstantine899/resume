// ============================================
// AdminGate — localStorage flag gate for /admin (plan §8.4-B, WU-5)
// ============================================
//
// Variant B (chosen 2026-09-30): no secrets in the URL — a localStorage
// flag decides between the dev login panel and the layout shell. The flag
// is read at STORE CREATION (slice initialState hydration), so an authed
// visitor never sees a login flash.

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { storeReducers } from '@/storeReducers';
import { ADMIN_AUTH_STORAGE_KEY } from '../model/storage';
import { AdminGate } from './AdminGate';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

const renderGate = () => {
  const store = configureStore({ reducer: storeReducers });
  const router = createMemoryRouter(
    [
      {
        path: '/admin',
        element: (
          <AdminGate>
            <div data-testid="admin-shell" />
          </AdminGate>
        ),
      },
    ],
    { initialEntries: ['/admin'] }
  );
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
  return store;
};

afterEach(() => {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
});

describe('AdminGate (WU-5)', () => {
  it('shows the dev login panel when the flag is missing — children stay hidden', () => {
    renderGate();

    expect(screen.getByTestId('admin-gate')).toBeInTheDocument();
    // Identity t: the KEY renders — hardcoded copy would fail here.
    expect(screen.getByText('adminGateTitle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminLoginDev' })).toBeInTheDocument();
    expect(screen.queryByTestId('admin-shell')).not.toBeInTheDocument();
  });

  it('renders children when the flag was persisted (hydrated at store creation)', () => {
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
    renderGate();

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-gate')).not.toBeInTheDocument();
  });

  it('login button persists the flag and reveals children', () => {
    renderGate();

    fireEvent.click(screen.getByRole('button', { name: 'adminLoginDev' }));

    expect(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)).toBe('1');
    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-gate')).not.toBeInTheDocument();
  });
});
