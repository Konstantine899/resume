// ============================================
// AdminDashboard - Public API (FSD slice)
// ============================================

export { adminDashboardReducer, clearMetrics, setMetrics } from './model/adminDashboardSlice';
export { selectAdminMetrics, selectMetricsCount } from './model/selectors';
export { mockAdminMetrics } from './model/mockAdminMetrics';
export { StatCard } from './ui/StatCard';
export type { StatCardProps } from './ui/StatCard';
export type { AdminDashboardRootState, AdminDashboardState, AdminMetric } from './model/types';
