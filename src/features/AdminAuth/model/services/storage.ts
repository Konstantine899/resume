export const ADMIN_AUTH_STORAGE_KEY = 'resume.admin.auth';

/** Plan 2 Step 3: auth state lives in memory only; never read a persisted flag. */
export const readAdminAuthFlag = (): boolean => false;

/** Plan 2 Step 3: persisting the dev flag into localStorage is no longer used. */
export const persistAdminAuth = (_isAuthed: boolean): void => void 0;
