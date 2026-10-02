// ============================================
// adminAuth slice — WU-2 stub (admin-panel plan)
// ============================================
//
// Stub auth session for the localStorage-based AdminGate (plan §8.4-B):
// `enter`/`leave` only flip a flag today; the Supabase/NestJS stage swaps
// the flag for a token without touching the public action API.

import { createSlice } from '@reduxjs/toolkit';

import { readAdminAuthFlag } from './storage';
import type { AdminAuthState } from './types';

const initialState: AdminAuthState = { isAuthed: false };

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    enter(state) {
      state.isAuthed = true;
    },
    leave(state) {
      state.isAuthed = false;
    },
  },
});

export const { enter, leave } = authSlice.actions;

// Lazy hydration (plan §8.4-B, WU-5): the persisted flag is read on the
// FIRST reducer call — i.e. at configureStore time — not at module import.
// A const `initialState` would freeze whatever localStorage held when the
// bundle first loaded, so a flag set later (tests, late login) never showed.
// The gate's first render is still correct: no sync effect, no login flash.
export const adminAuthReducer: typeof authSlice.reducer = (state, action) =>
  authSlice.reducer(state ?? { isAuthed: readAdminAuthFlag() }, action);
