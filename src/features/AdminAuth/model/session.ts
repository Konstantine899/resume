// ============================================
// AdminAuth session transitions — WU-5 → review fix
// ============================================
//
// Single home for the persist+dispatch pair: every auth transition writes
// the localStorage flag AND the slice so the two never diverge (§8.4-B
// contract). Review finding (Duplicated Code / Data Clumps): the pair used
// to be inlined in AdminGate (screen removed 2026-10-02) and AdminLayout.
//
// Plain `(dispatch) => void` helpers, not RTK thunks: bare `useDispatch()`
// is typed `Dispatch<UnknownAction>` (react-redux v9) and rejects thunk
// functions at the type level; a sync pair needs no middleware.

import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';

import { login as loginAction, logout as logoutAction } from './authSlice';
import { persistAdminAuth } from './storage';

/** Set the flag AND flip the slice (JWT-stage swap-point — no UI calls it since the gate removal). */
export const login = (dispatch: Dispatch<UnknownAction>): void => {
  persistAdminAuth(true);
  dispatch(loginAction());
};

/** Clear the flag (survives reload) AND flip the live slice state. Used by the admin header's "Sign out" → navigate('/'). */
export const logout = (dispatch: Dispatch<UnknownAction>): void => {
  persistAdminAuth(false);
  dispatch(logoutAction());
};
