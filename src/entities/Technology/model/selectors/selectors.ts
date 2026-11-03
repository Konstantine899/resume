// Technology selectors (SPEC D4 — seed fallback, never throw).
//
// The slice key may be absent from state (bare tests, Storybook without a
// StoreProvider): a missing slice reads as the SEED, while an EMPTY stored
// catalog (`[]` — the admin deleted everything) stays empty. The nullish
// fallback distinguishes the two on purpose.

import { seedTechnologies } from '../constants/constants';
import type { Technology, TechnologyRootState } from '../types/types';

export const selectAllTechnologies = (state: TechnologyRootState): Technology[] =>
  state.technologies ?? seedTechnologies();

/** Catalog keys in display order — the admin toggle/option source (D2). */
export const selectTechnologyKeys = (state: TechnologyRootState): string[] =>
  selectAllTechnologies(state).map((tech) => tech.key);
