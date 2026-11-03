// Public-API hygiene (barrel-hygiene #301 / gold standard: admin-jobs-refactor
// WU-8, admin-contact-refactor WU-3).
//
// The barrel may only re-export symbols that have a production consumer
// at the BARREL level. Seventeen re-exports below were dead there — the
// model is consumed via deep imports (storeReducers.ts → slices/skillsSlice,
// HomePage.tsx → model/selectors, feature unit tests + vi.mock factories →
// relative deep paths), so they are gone from `index.ts`. Their
// IMPLEMENTATIONS stay where they are — the slice/selector/storage unit
// tests import the modules directly and keep covering them.
//
// `persistSkills` / `removeSkills` STAY: `fsd-imports/tests-public-api-only`
// forces `HomePage.test` to consume them through the barrel (deep-import
// from a test is an ESLint error — AdminAbout/AdminMyWork/AdminContact
// carry the identical pair).
//
// Types are erased at runtime, so the four type removals
// (AdminSkillsRootState + the three *Props interfaces) are only
// assertable as absence — same precedent as AdminContact's index.test.ts.

import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = [
  // selectors — HomePage deep-imports model/selectors
  'selectSkillCategoryById',
  'selectSkillsData',
  // storage — unit tests / vi.mock deep-import services/storage
  'normalizeIconSvg',
  'readSkills',
  'SKILLS_STORAGE_KEY',
  // slice actions + reducer — storeReducers deep-imports skillsSlice,
  // the editor UI uses relative deep imports
  'addSkillCategory',
  'addTechnology',
  'deleteSkillCategory',
  'deleteTechnology',
  'resetToDefaults',
  'updateSkillCategory',
  'updateTechnology',
  'skillsReducer',
  // types (erased at runtime — absence-only pins)
  'AdminSkillsRootState',
  'SkillCategoryFormProps',
  'SkillsEditorListProps',
  'TechnologyFormProps',
] as const;

const LIVE_EXPORTS = [
  'selectAllSkillsData',
  'persistSkills',
  'removeSkills',
  'SkillCategoryForm',
  'SkillsEditorList',
  'TechnologyForm',
] as const;

describe('AdminSkills public API (#301 barrel hygiene)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero barrel consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});
