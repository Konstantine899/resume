// ============================================
// DashboardPage — first admin page, metrics from Redux (plan WU-4)
// ============================================
//
// Builds the REAL reducer map (src/storeReducers) so the page proves the
// store wiring too; identity i18n keeps the copy assertions on keys.

import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import { clearMetrics, mockAdminMetrics } from '@/features/AdminDashboard';
import type { AdminMetric } from '@/features/AdminDashboard';
import { storeReducers } from '@/storeReducers';
import { DashboardPage } from './DashboardPage';

// Typed access into the shared mock without `!` (no-non-null-assertion).
const pickMetric = (id: string): AdminMetric => {
  const found = mockAdminMetrics.find((metric) => metric.id === id);
  if (!found) throw new Error(`mock metric "${id}" not found`);
  return found;
};

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

const renderDashboard = (store = configureStore({ reducer: storeReducers })) => {
  render(
    <Provider store={store}>
      <DashboardPage />
    </Provider>
  );
  return store;
};

describe('DashboardPage', () => {
  it('renders every metric from the store (the typed mock)', () => {
    renderDashboard();

    expect(
      screen.getByRole('heading', { level: 1, name: 'adminNavDashboard' })
    ).toBeInTheDocument();
    mockAdminMetrics.forEach((metric) => {
      expect(screen.getByText(metric.labelKey)).toBeInTheDocument();
      expect(screen.getByText(String(metric.value))).toBeInTheDocument();
    });
  });

  it('shows the empty state when the store has no metrics', () => {
    const store = configureStore({ reducer: storeReducers });
    store.dispatch(clearMetrics());
    renderDashboard(store);

    expect(screen.getByText('adminDashboardEmpty')).toBeInTheDocument();
    expect(screen.queryByText(pickMetric('projects').labelKey)).not.toBeInTheDocument();
  });
});
