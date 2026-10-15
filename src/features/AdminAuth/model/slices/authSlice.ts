// ============================================
// adminAuth slice — WU-2 stub (admin-panel plan)
// ============================================
//
// Stub auth session kept as the §8.4 JWT swap-point (plan rev. 2026-10-02:
// the AdminGate screen was removed — nothing reads `isAuthed` yet). `login`/
// `logout` still flip the flag so the flag⇄state contract stays intact; the
// future token stage swaps the storage module without touching the public
// action API. Side effects (persisting the flag) live in `session.ts` —
// reducers stay pure.

import { createSlice } from '@reduxjs/toolkit';

import { readAdminAuthFlag } from '../services/storage';
import type { AdminAuthState } from '../types/types';

const initialState: AdminAuthState = { isAuthed: false };

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthed = true;
    },
    logout(state) {
      state.isAuthed = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

// Lazy hydration (plan §8.4-B): the persisted flag is read on the FIRST
// reducer call — i.e. at configureStore time — not at module import. A const
// `initialState` would freeze whatever localStorage held when the bundle
// first loaded, so a flag set later (tests, a future JWT stage) never showed.
export const adminAuthReducer: typeof authSlice.reducer = (state, action) =>
  authSlice.reducer(state ?? { isAuthed: readAdminAuthFlag() }, action);
