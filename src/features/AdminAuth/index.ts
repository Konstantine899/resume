// ============================================
// AdminAuth - Public API (FSD slice)
// ============================================

export { adminAuthReducer, enter, leave } from './model/authSlice';
export { selectIsAuthed } from './model/selectors';
export type { AdminAuthRootState, AdminAuthState } from './model/types';
