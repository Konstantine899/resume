// ============================================
// AdminAuth - Public API (FSD slice)
// ============================================

export { adminAuthReducer } from './model/slices/authSlice';
export { login, logout } from './model/services/session';
export { selectIsAuthed } from './model/selectors';
export {
  ADMIN_AUTH_STORAGE_KEY,
  persistAdminAuth,
  readAdminAuthFlag,
} from './model/services/storage';
export type { AdminAuthRootState, AdminAuthState } from './model/types';
