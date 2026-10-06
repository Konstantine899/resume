// ============================================
// contactContent slice — plan Contact CRUD §4
// ============================================
//
// Stage-1 store for the Contact document. Two rules define it:
// - `updateContactContent` is a FULL REPLACE (§4): the admin form always
//   submits every field, so there is no partial payload to merge.
// - Lazy hydration: the stored document is read on the FIRST reducer
//   call — i.e. at configureStore — not at module import (lesson
//   resume-rtk-lazy-hydration: a module-level initialState would freeze
//   whatever localStorage held when the bundle loaded).
//
// Side effects (localStorage writes) live in `storage.ts`; callers
// persist FIRST and dispatch only when persist returned success (§4).

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ContactContent } from '@/entities/ContactContent';
import { createContactSeed } from '../services/seed';
import { readContactContent } from '../services/storage';

const contactContentSlice = createSlice({
  name: 'contactContent',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: createContactSeed(),
  reducers: {
    updateContactContent(_state, action: PayloadAction<ContactContent>) {
      return action.payload;
    },
    resetToDefaults() {
      return createContactSeed();
    },
  },
});

export const { updateContactContent, resetToDefaults } = contactContentSlice.actions;

/** Store → stored document → seed: every unreadable state lands on the seed (§7). */
export const contactContentReducer: typeof contactContentSlice.reducer = (state, action) =>
  contactContentSlice.reducer(state ?? readContactContent() ?? createContactSeed(), action);
