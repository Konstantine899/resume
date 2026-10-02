// ============================================
// AdminAuth selectors (admin-panel plan WU-2)
// ============================================

import type { AdminAuthRootState } from './types';

export const selectIsAuthed = (state: AdminAuthRootState): boolean => state.adminAuth.isAuthed;
