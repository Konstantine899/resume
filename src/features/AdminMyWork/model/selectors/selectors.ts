// myWork selectors (plan_projects_crud §4).

import { getFeaturedProjects, type Project } from '@/entities/Project';
import type { MyWorkRootState } from '../types/types';

export const selectAllProjects = (state: MyWorkRootState): Project[] => state.myWork;

/** Vitrina read path (A1): only `featured: true` records surface on Home. */
export const selectFeaturedProjects = (state: MyWorkRootState): Project[] =>
  getFeaturedProjects(selectAllProjects(state));

export const selectProjectById = (state: MyWorkRootState, id: string): Project | undefined =>
  selectAllProjects(state).find((project) => project.id === id);
