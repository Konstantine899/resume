// ============================================
// adminAuth slice — WU-2 stub (admin-panel plan)
// ============================================
//
// Stub auth session for the localStorage-based AdminGate (plan §8.4-B):
// `enter`/`leave` only flip a flag today; the Supabase/NestJS stage swaps
// the flag for a token without touching the public action API.

import { createSlice } from '@reduxjs/toolkit';

import type { AdminAuthState } from './types';

const initialState: AdminAuthState = {
  isAuthed: false,
};

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
export const adminAuthReducer = authSlice.reducer;
