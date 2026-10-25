import { createSlice } from '@reduxjs/toolkit';

import type { AdminAuthState } from '../types/types';

const authSlice = createSlice({
  name: 'adminAuth',
  initialState: { isAuthed: false } as AdminAuthState,
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

export const adminAuthReducer = authSlice.reducer;
