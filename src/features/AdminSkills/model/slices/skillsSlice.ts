// ============================================
// skills slice — plan_skills_crud §4
// ============================================
//
// Stage-1 store for the NESTED skills collection (`SkillCategoryData[]` —
// category → technologies). Rules:
// - Persist FIRST, dispatch only when persist returned success (§3) —
//   the reducer never touches localStorage itself; actions carry plain
//   payloads and immer does the immutable nested edits (R-8).
// - Lazy hydration: the stored collection is read on the FIRST reducer
//   call — i.e. at configureStore — not at module import (lesson
//   resume-rtk-lazy-hydration).
// - `resetToDefaults` returns a CLONE of the seed: the seed constant is
//   shared with the vitrina, so returning the live reference would let a
//   later immer edit corrupt `SKILLS_DATA` for every consumer.
//
// Side effects (localStorage writes) live in `services/storage.ts`.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { SkillCategoryData, Technology } from '@/entities/Skill';
import { readSkills, skillsSeed } from '../services/storage';

const skillsSlice = createSlice({
  name: 'adminSkills',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: [] as SkillCategoryData[],
  reducers: {
    addSkillCategory(state, action: PayloadAction<SkillCategoryData>) {
      state.push(action.payload);
    },
    addTechnology(state, action: PayloadAction<{ categoryId: string; technology: Technology }>) {
      const category = state.find((entry) => entry.category === action.payload.categoryId);
      if (category) category.technologies.push(action.payload.technology);
    },
    updateSkillCategory(
      state,
      action: PayloadAction<{ category: string; patch: Partial<SkillCategoryData> }>
    ) {
      const found = state.find((entry) => entry.category === action.payload.category);
      if (found) Object.assign(found, action.payload.patch);
    },
    updateTechnology(
      state,
      action: PayloadAction<{ categoryId: string; techName: string; patch: Partial<Technology> }>
    ) {
      const category = state.find((entry) => entry.category === action.payload.categoryId);
      const technology = category?.technologies.find(
        (tech) => tech.name === action.payload.techName
      );
      if (technology) Object.assign(technology, action.payload.patch);
    },
    deleteTechnology(state, action: PayloadAction<{ categoryId: string; techName: string }>) {
      const category = state.find((entry) => entry.category === action.payload.categoryId);
      if (!category) return;
      const index = category.technologies.findIndex(
        (tech) => tech.name === action.payload.techName
      );
      if (index !== -1) category.technologies.splice(index, 1);
    },
    deleteSkillCategory(state, action: PayloadAction<string>) {
      const index = state.findIndex((entry) => entry.category === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
    resetToDefaults() {
      return skillsSeed();
    },
  },
});

export const {
  addSkillCategory,
  addTechnology,
  deleteSkillCategory,
  deleteTechnology,
  resetToDefaults,
  updateSkillCategory,
  updateTechnology,
} = skillsSlice.actions;

/** Store → stored collection → seed: every unreadable state lands on the seed (§7). */
export const skillsReducer: typeof skillsSlice.reducer = (state, action) =>
  skillsSlice.reducer(state ?? readSkills() ?? skillsSeed(), action);
