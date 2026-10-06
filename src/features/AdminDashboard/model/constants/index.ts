// ============================================
// AdminDashboard — typed mock metrics (admin-panel plan WU-4)
// ============================================
//
// Initial state of the slice AND the fixture every test renders with
// (plan criterion: "mock typed in types.ts, tests use THE SAME mock").

import type { AdminMetric } from '../types';

export const mockAdminMetrics: AdminMetric[] = [
  { id: 'projects', labelKey: 'adminMetricProjects', value: 4 },
  { id: 'skills', labelKey: 'adminMetricSkills', value: 12 },
  { id: 'sections', labelKey: 'adminMetricSections', value: 5 },
];
