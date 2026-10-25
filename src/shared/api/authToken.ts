// ============================================
// In-memory access token (auth, Plan 2 step 2)
// ============================================
//
// The access token MUST live in memory only — never in localStorage,
// sessionStorage or a cookie readable by JS. A page reload simply drops
// it; the session is restored via the httpOnly refresh cookie on
// /auth/refresh. Logout wipes the in-memory value.
//
// Multiple alias names are exported on purpose: callers/tests may import
// either the short (`get`/`set`/`clear`) or the descriptive
// (`getAccessToken`/...) forms.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null | undefined): void {
  accessToken = token ?? null;
}

export function clearAccessToken(): void {
  accessToken = null;
}

// Short aliases.
export const get = getAccessToken;
export const set = setAccessToken;
export const clear = clearAccessToken;

// Token aliases.
export const getToken = getAccessToken;
export const setToken = setAccessToken;
export const clearToken = clearAccessToken;

// Auth-token aliases.
export const getAuthToken = getAccessToken;
export const setAuthToken = setAccessToken;
export const clearAuthToken = clearAccessToken;

export const authToken = {
  get: getAccessToken,
  set: setAccessToken,
  clear: clearAccessToken,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getToken,
  setToken,
  clearToken,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} as const;

export default authToken;
