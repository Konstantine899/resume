import type { AuthRootState, AuthState } from '../types/types';
import type { AuthUser } from '@/shared/api/types';

export const selectAuthUser = (state: AuthRootState): AuthUser | null => state.auth.user ?? null;

export const selectAuthState = (state: AuthRootState): AuthState => state.auth;

export const selectIsAdmin = (state: AuthRootState): boolean => state.auth.user?.role === 'admin';

// Compatibility export: any authenticated session (admin OR regular user).
export const selectIsAuthed = (state: AuthRootState): boolean => state.auth.user !== null;

export const selectIsAuthenticated = (state: AuthRootState): boolean => state.auth.user !== null;

export const selectBootstrapFinished = (state: AuthRootState): boolean =>
  state.auth.bootstrapFinished === true;
