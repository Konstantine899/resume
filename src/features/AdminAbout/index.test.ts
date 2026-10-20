// Public-API hygiene (admin-about-refactor WU-3, admin-about-table WU-15;
// SPEC R-9 "баррель-пины").
//
// The barrel may only re-export symbols that have a production consumer
// at the BARREL level. Seven values + one type below were dead there (the
// feature's own tests / storeReducers / HomePage deep-import their modules
// directly), so they are gone from `index.ts`. Their IMPLEMENTATIONS stay
// where they are — the slice/selector/storage unit tests import the
// modules directly and keep covering them.
//
// Precedent: `src/features/AdminJobs/index.test.ts` (admin-jobs-refactor
// WU-8) and `src/features/AdminMyWork/index.test.ts` (WU-6). Types are
// erased at runtime, so `AboutEditorListProps` (dropped from the barrel in
// admin-about-table WU-15 — zero barrel consumers) and
// `AboutContentRootState` (removed) are not assertable here.

import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = [
  'selectAboutContent',
  'ABOUT_CONTENT_STORAGE_KEY',
  'readAboutContent',
  'aboutContentReducer',
  'resetToDefaults',
  'updateAboutContent',
  'AboutContentRootState',
] as const;

const LIVE_EXPORTS = [
  'createAboutSeed',
  'persistAboutContent',
  'removeAboutContent',
  'AboutEditorList',
] as const;

describe('AdminAbout public API (SPEC R-9)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero barrel consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});
