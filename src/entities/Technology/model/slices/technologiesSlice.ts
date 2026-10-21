// ============================================
// technologies slice (SPEC D5)
// ============================================
//
// Stage-1 store for the CATALOG collection (`Technology[]`). Rules:
// - Persist FIRST, dispatch only when persist returned success — the
//   reducer never touches localStorage (side effects live in storage.ts).
// - Lazy hydration: the stored catalog is read on the FIRST reducer call —
//   i.e. at configureStore — not at module import (resume-rtk-lazy-hydration).
// - The record key IS the identity (D7): edits change url/invertInDark only.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { seedTechnologies } from '../constants/constants';
import { readTechnologies } from '../services/storage';
import type { Technology, TechnologyUpdatePatch } from '../types/types';

const technologiesSlice = createSlice({
  name: 'technologies',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: [] as Technology[],
  reducers: {
    addTechnology(state, action: PayloadAction<Technology>) {
      state.push(action.payload);
    },
    updateTechnology(state, action: PayloadAction<{ key: string; patch: TechnologyUpdatePatch }>) {
      const found = state.find((tech) => tech.key === action.payload.key);
      if (found) Object.assign(found, action.payload.patch);
    },
    removeTechnology(state, action: PayloadAction<string>) {
      const index = state.findIndex((tech) => tech.key === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
  },
});

export const { addTechnology, removeTechnology, updateTechnology } = technologiesSlice.actions;

/** Store → stored catalog → seed: every unreadable state lands on the seed (D5). */
export const technologiesReducer: typeof technologiesSlice.reducer = (state, action) =>
  technologiesSlice.reducer(state ?? readTechnologies() ?? seedTechnologies(), action);
