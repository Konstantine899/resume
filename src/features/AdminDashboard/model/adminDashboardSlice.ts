// ============================================
// AdminDashboard slice — WU-4 data layer (admin-panel plan)
// ============================================

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { mockAdminMetrics } from './mockAdminMetrics';
import type { AdminDashboardState, AdminMetric } from './types';

const initialState: AdminDashboardState = {
  metrics: mockAdminMetrics,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<AdminMetric[]>) => {
      state.metrics = action.payload;
    },
    clearMetrics: (state) => {
      state.metrics = [];
    },
  },
});

export const { setMetrics, clearMetrics } = adminDashboardSlice.actions;
export const adminDashboardReducer = adminDashboardSlice.reducer;
