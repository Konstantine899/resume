// ============================================
// AdminDashboard - Public API (FSD slice)
// ============================================

// Only what consumers actually import — `setMetrics`/`selectMetricsCount`
// were exported speculatively (review finding) and stay module-internal
// until a real consumer appears (tests deep-import them from model/).
export { adminDashboardReducer, clearMetrics } from './model/slices/adminDashboardSlice';
export { selectAdminMetrics } from './model/selectors';
export { mockAdminMetrics } from './model/constants';
export { StatCard } from './ui/StatCard';
export type { StatCardProps } from './ui/StatCard';
export type { AdminDashboardRootState, AdminDashboardState, AdminMetric } from './model/types';
