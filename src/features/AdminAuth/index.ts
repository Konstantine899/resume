// ============================================
// AdminAuth - Public API (FSD slice)
// ============================================

export { adminAuthReducer } from './model/authSlice';
export { login, logout } from './model/session';
export { selectIsAuthed } from './model/selectors';
export { ADMIN_AUTH_STORAGE_KEY, persistAdminAuth, readAdminAuthFlag } from './model/storage';
export type { AdminAuthRootState, AdminAuthState } from './model/types';
