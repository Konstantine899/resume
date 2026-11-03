import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from '@/shared/api/types';
import type { AuthState } from '../types/types';

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userSet(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    signedOut(state) {
      state.user = null;
      state.authModalOpen = false;
    },
    authModalOpen(state, action: PayloadAction<boolean | undefined>) {
      state.authModalOpen = action.payload ?? true;
    },
    setAuthModalOpen(state, action: PayloadAction<boolean>) {
      state.authModalOpen = action.payload;
    },
    openAuthModal(state) {
      state.authModalOpen = true;
    },
    closeAuthModal(state) {
      state.authModalOpen = false;
    },
    bootstrapFinished(state, action: PayloadAction<boolean | undefined>) {
      state.bootstrapFinished = action.payload ?? true;
    },
  },
});

export const {
  userSet,
  signedOut,
  authModalOpen,
  setAuthModalOpen,
  openAuthModal,
  closeAuthModal,
  bootstrapFinished,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
export { authSlice };
