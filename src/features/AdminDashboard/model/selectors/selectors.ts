// ============================================
// AdminDashboard — selectors (admin-panel plan WU-4)
// ============================================

import type { AdminDashboardRootState, AdminMetric } from '../types';

export const selectAdminMetrics = (state: AdminDashboardRootState): AdminMetric[] =>
  state.adminDashboard.metrics;

export const selectMetricsCount = (state: AdminDashboardRootState): number =>
  state.adminDashboard.metrics.length;
