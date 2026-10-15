// ============================================
// AdminDashboard — model types (admin-panel plan WU-4)
// ============================================

/**
 * One dashboard metric. `labelKey` is an i18n KEY, never display copy —
 * StatCard resolves it through t() (i18n-first: mock data must not smuggle
 * hardcoded strings into the UI).
 */
export interface AdminMetric {
  id: string;
  labelKey: string;
  value: number | string;
}

export interface AdminDashboardState {
  metrics: AdminMetric[];
}

/**
 * Slice-local root shape — same pattern as AdminAuth: the slice types its
 * OWN root state instead of importing a global RootState (which does not
 * exist; reducers are injected from the composition root).
 */
export type AdminDashboardRootState = {
  adminDashboard: AdminDashboardState;
};
