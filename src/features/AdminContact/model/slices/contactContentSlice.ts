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
//
// contact-rows-crud R-2 (D6): three granular row operations join the
// full-replace — upsert/remove target one table, resetContactTable
// restores ONE table's seed (the section-wide resetToDefaults dies with
// the old footer form in WU-5).

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ContactContent, ContactSocialLink, LocalizedText } from '@/entities/ContactContent';
import { createContactSeed } from '../services/seed';
import { readContactContent } from '../services/storage';

/** The two localized-string tables (ContactRowForm caps live on these only). */
export type ContactTextTableRow = 'texts' | 'formTexts';

/** The three editable tables of the Contact document (contact-rows-crud + contact-social-crud). */
export type ContactTableRow = ContactTextTableRow | 'socials';

/** Value shape per table: texts/formTexts hold locales, socials holds {name, href}. */
export type ContactTableValue = LocalizedText | ContactSocialLink;

/**
 * Document field backing a table id: texts/formTexts are field-identical,
 * the socials TABLE lives under the `socialLinks` document field (S1/S5).
 */
export const contactTableField = (table: ContactTableRow): 'texts' | 'formTexts' | 'socialLinks' =>
  table === 'socials' ? 'socialLinks' : table;

const contactContentSlice = createSlice({
  name: 'contactContent',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: createContactSeed(),
  reducers: {
    updateContactContent(_state, action: PayloadAction<ContactContent>) {
      return action.payload;
    },
    upsertContactTableRow(
      state,
      action: PayloadAction<{ table: ContactTableRow; key: string; value: ContactTableValue }>
    ) {
      const { table, key, value } = action.payload;
      // The caller always sends the value shape matching its table (the
      // form owns that typing) — the union write needs one widening cast.
      const field = contactTableField(table);
      (state[field] as Record<string, ContactTableValue>)[key] = value;
    },
    removeContactTableRow(state, action: PayloadAction<{ table: ContactTableRow; key: string }>) {
      const { table, key } = action.payload;
      // Reflect: `delete state[table][key]` is a TS2790 error (operand
      // must be optional) on the non-undefined index signature.
      Reflect.deleteProperty(state[contactTableField(table)], key);
    },
    resetContactTable(state, action: PayloadAction<{ table: ContactTableRow }>) {
      const seed = createContactSeed();
      // Per-branch write: TS cannot correlate a union-key indexed write.
      if (action.payload.table === 'texts') {
        state.texts = seed.texts;
      } else if (action.payload.table === 'formTexts') {
        state.formTexts = seed.formTexts;
      } else {
        state.socialLinks = seed.socialLinks;
      }
    },
  },
});

export const {
  updateContactContent,
  upsertContactTableRow,
  removeContactTableRow,
  resetContactTable,
} = contactContentSlice.actions;

/** Store → stored document → seed: every unreadable state lands on the seed (§7). */
export const contactContentReducer: typeof contactContentSlice.reducer = (state, action) =>
  contactContentSlice.reducer(state ?? readContactContent() ?? createContactSeed(), action);
