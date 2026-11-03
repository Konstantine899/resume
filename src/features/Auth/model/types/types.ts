import type { AuthUser } from '@/shared/api/types';

export type AuthState = {
  user: AuthUser | null;
  authModalOpen?: boolean;
  bootstrapFinished?: boolean;
};

/** Root-state view as seen by Auth selectors. */
export type AuthRootState = {
  auth: AuthState;
};
