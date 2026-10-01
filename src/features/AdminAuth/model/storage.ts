// ============================================
// AdminAuth — localStorage flag (plan §8.4-B, WU-5)
// ============================================
//
// Single source of truth for the dev-login flag: the slice hydrates from
// `readAdminAuthFlag()` at store creation; writes happen only through
// `persistAdminAuth()` next to the corresponding dispatch. Swapping the
// flag for a JWT later replaces THIS module and the gate condition —
// nothing else (§8.4 migration note).

export const ADMIN_AUTH_STORAGE_KEY = 'resume.admin.auth';

/**
 * `true` only when the persisted flag is exactly `'1'`.
 * Storage can throw (privacy mode, disabled cookies) — treat that as
 * logged-out instead of crashing the admin shell.
 */
export const readAdminAuthFlag = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/** Mirror a login/logout decision into localStorage (fails soft, like the read). */
export const persistAdminAuth = (isAuthed: boolean): void => {
  try {
    if (isAuthed) {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable — the in-memory slice still works for this session.
  }
};
