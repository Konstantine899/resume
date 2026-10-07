// ============================================
// myWork slice — plan_projects_crud §4
// ============================================
//
// Stage-1 store for the PROJECTS collection (`Project[]`). Rules:
// - Persist FIRST, dispatch only when persist returned success (§3) —
//   the reducer therefore NEVER generates ids or timestamps itself: the
//   caller builds the exact record/patch via `makeProjectRecord` /
//   `makeUpdatePatch`, persists the resulting array, then dispatches the
//   SAME payload. Store and storage stay byte-identical.
// - Lazy hydration: the stored collection is read on the FIRST reducer
//   call — i.e. at configureStore — not at module import (lesson
//   resume-rtk-lazy-hydration).
//
// Side effects (localStorage writes) live in `storage.ts`.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Project, ProjectFormData } from '@/entities/Project';
import { createProjectsSeed } from '../services/seed';
import { readProjects } from '../services/storage';
import type { ProjectUpdatePatch } from '../types/types';

const myWorkSlice = createSlice({
  name: 'myWork',
  // Placeholder for RTK's typing; the real first state comes from the
  // hydration wrapper below.
  initialState: [] as Project[],
  reducers: {
    addProject(state, action: PayloadAction<Project>) {
      state.push(action.payload);
    },
    updateProject(state, action: PayloadAction<{ id: string; patch: ProjectUpdatePatch }>) {
      const found = state.find((project) => project.id === action.payload.id);
      if (found) Object.assign(found, action.payload.patch);
    },
    deleteProject(state, action: PayloadAction<string>) {
      const index = state.findIndex((project) => project.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
    resetToDefaults() {
      return createProjectsSeed();
    },
  },
});

export const { addProject, deleteProject, resetToDefaults, updateProject } = myWorkSlice.actions;

/**
 * Create payload: system-managed `id` + ISO stamps are generated HERE (§5),
 * once — the form persists the array built from this record and then
 * dispatches it verbatim (§3 order guarantees store === storage).
 */
export const makeProjectRecord = (data: ProjectFormData): Project => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data,
});

/** Update payload: form fields + ONE timestamp shared by persist and dispatch. */
export const makeUpdatePatch = (data: ProjectFormData): ProjectUpdatePatch => ({
  ...data,
  updatedAt: new Date().toISOString(),
});

/** Store → stored collection → seed: every unreadable state lands on the seed (§7). */
export const myWorkReducer: typeof myWorkSlice.reducer = (state, action) =>
  myWorkSlice.reducer(state ?? readProjects() ?? createProjectsSeed(), action);
