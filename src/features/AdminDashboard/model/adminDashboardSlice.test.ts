// ============================================
// adminDashboard slice — WU-4 data layer (admin-panel plan)
// ============================================
//
// The dashboard's metrics come from Redux with the typed mock as initial
// state (plan criterion: tests consume THE SAME mock). Reducer-map
// injection from the composition root is covered by StoreProvider.test;
// here we only prove the pure state machine and the selectors.

import { describe, expect, it } from 'vitest';

import { mockAdminMetrics } from './mockAdminMetrics';
import { adminDashboardReducer, clearMetrics, setMetrics } from './adminDashboardSlice';
import { selectAdminMetrics, selectMetricsCount } from './selectors';
import type { AdminDashboardRootState, AdminMetric } from './types';

describe('adminDashboard slice', () => {
  it('boots with the typed mock metrics (tests share the same mock)', () => {
    expect(adminDashboardReducer(undefined, { type: 'unknown' })).toEqual({
      metrics: mockAdminMetrics,
    });
  });

  it('setMetrics replaces the list', () => {
    const next: AdminMetric[] = [{ id: 'x', labelKey: 'adminMetricX', value: 1 }];

    expect(adminDashboardReducer({ metrics: mockAdminMetrics }, setMetrics(next))).toEqual({
      metrics: next,
    });
  });

  it('clearMetrics empties the list (source of the empty state)', () => {
    expect(adminDashboardReducer({ metrics: mockAdminMetrics }, clearMetrics())).toEqual({
      metrics: [],
    });
  });

  it('exposes namespaced action types', () => {
    expect(setMetrics([]).type).toBe('adminDashboard/setMetrics');
    expect(clearMetrics().type).toBe('adminDashboard/clearMetrics');
  });
});

describe('dashboard selectors', () => {
  const state: AdminDashboardRootState = { adminDashboard: { metrics: mockAdminMetrics } };

  it('selectAdminMetrics reads the slice', () => {
    expect(selectAdminMetrics(state)).toBe(mockAdminMetrics);
  });

  it('selectMetricsCount exposes the length (0 drives the empty state)', () => {
    expect(selectMetricsCount(state)).toBe(mockAdminMetrics.length);

    const empty: AdminDashboardRootState = { adminDashboard: { metrics: [] } };
    expect(selectMetricsCount(empty)).toBe(0);
  });
});
