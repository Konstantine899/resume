// Compatibility barrel: AdminAuth now projects from the JWT-backed Auth slice.
// Kept (instead of deletion) so existing import sites and tests continue to
// resolve during the migration window; there is no separate reducer or storage.
export { selectAuthUser, selectIsAdmin, selectIsAuthed } from '@/features/Auth';
export type {
  AuthState as AdminAuthState,
  AuthRootState as AdminAuthRootState,
} from '@/features/Auth';
