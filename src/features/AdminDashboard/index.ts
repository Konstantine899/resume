// ============================================
// AdminDashboard - Public API (FSD slice)
// ============================================

// Only what consumers actually import — `setMetrics`/`selectMetricsCount`
// were exported speculatively (review finding) and stay module-internal
// until a real consumer appears (tests deep-import them from model/).
export { mockAdminMetrics } from './model/constants';
export { selectAdminMetrics } from './model/selectors';
export { adminDashboardReducer, clearMetrics } from './model/slices/adminDashboardSlice';
export type {
  AdminDashboardRootState,
  AdminDashboardState,
  AdminMetric,
} from './model/types/types';
export { StatCard } from './ui/StatCard/StatCard';
export type { StatCardProps } from './ui/StatCard/StatCard';
