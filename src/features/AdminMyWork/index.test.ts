// Public-API hygiene (admin-mywork-refactor WU-6 / SPEC R-7).
//
// The barrel may only re-export symbols that have a production consumer.
// Twelve values + two types below were dead at the barrel level (the
// feature's own tests / storeReducers deep-import their modules
// directly), so they are gone from `index.ts`. Their IMPLEMENTATIONS
// stay where they are — the slice/selector/storage unit tests import
// the modules directly and keep covering them.
//
// Precedent: `src/features/AdminJobs/index.test.ts` (admin-jobs-refactor
// WU-8). Deviation vs the plan: the plan said HomePage.test should
// deep-import `removeProjects` — that is an ESLint error
// (`fsd-imports/tests-public-api-only`), so `removeProjects` stays a
// barrel export and HomePage.test keeps the barrel import; this file
// pins the live set so a future barrel-bloat regression fails CI.

import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = [
  'selectFeaturedProjects',
  'selectProjectById',
  'createProjectsSeed',
  'PROJECTS_STORAGE_KEY',
  'readProjects',
  'persistProjects',
  'addProject',
  'deleteProject',
  'makeProjectRecord',
  'makeUpdatePatch',
  'resetToDefaults',
  'updateProject',
  'MyWorkEditorListProps',
  'ProjectFormProps',
] as const;

const LIVE_EXPORTS = [
  'selectAllProjects',
  'removeProjects',
  'myWorkReducer',
  'FieldEditForm',
  'MyWorkEditorList',
  'ProjectForm',
] as const;

describe('AdminMyWork public API (SPEC R-7)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero production consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});
