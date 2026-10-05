// ============================================
// aboutContent slice — plan About CRUD §4
// ============================================
//
// Stage-1 store for the About document. Two rules define it:
// - `updateAboutContent` is a FULL REPLACE (§4): the admin form always
//   submits every field, so there is no partial payload to merge.
// - Lazy hydration: the stored document is read on the FIRST reducer
//   call — i.e. at configureStore — not at module import (lesson
//   resume-rtk-lazy-hydration: a module-level initialState would freeze
//   whatever localStorage held when the bundle loaded).
//
// Side effects (localStorage writes) live in `storage.ts`; callers
// persist FIRST and dispatch only when persist returned success (§4).

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from '../services/seed';
import { readAboutContent } from '../services/storage';

const aboutContentSlice = createSlice({
  name: 'aboutContent',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: createAboutSeed(),
  reducers: {
    updateAboutContent(_state, action: PayloadAction<AboutContent>) {
      return action.payload;
    },
    resetToDefaults() {
      return createAboutSeed();
    },
  },
});

export const { updateAboutContent, resetToDefaults } = aboutContentSlice.actions;

/** Store → stored document → seed: every unreadable state lands on the seed (§7). */
export const aboutContentReducer: typeof aboutContentSlice.reducer = (state, action) =>
  aboutContentSlice.reducer(state ?? readAboutContent() ?? createAboutSeed(), action);
