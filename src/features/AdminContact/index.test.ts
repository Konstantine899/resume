// Public-API hygiene (admin-contact-refactor WU-3 / SPEC R-3).
//
// The barrel may only re-export symbols that have a production consumer
// at the BARREL level. Seven values below were dead there (the feature's
// own tests / storeReducers / HomePage deep-import their modules directly),
// so they are gone from `index.ts`. Their IMPLEMENTATIONS stay where they
// are — the slice/selector/storage unit tests import the modules directly
// and keep covering them.
//
// `createContactSeed` / `persistContactContent` / `removeContactContent`
// STAY: `fsd-imports/tests-public-api-only` forces `HomePage.test` to
// consume them through the barrel (AdminAbout/AdminMyWork index.ts carry
// the identical trio — SPEC R-3 follows that precedent, the deep-import
// variant is an ESLint error, verified by probe).
//
// Precedent: `src/features/AdminAbout/index.test.ts` (admin-about-refactor
// WU-3) and `src/features/AdminMyWork/index.test.ts` (WU-6). Types are
// erased at runtime, so `ContactEditorFormProps` (kept by SPEC R-3) and
// `ContactContentRootState` (removed) are not assertable here.

import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = [
  'selectContactContent',
  'CONTACT_CONTENT_STORAGE_KEY',
  'readContactContent',
  'contactContentReducer',
  'resetToDefaults',
  'updateContactContent',
  'ContactContentRootState',
] as const;

const LIVE_EXPORTS = [
  'createContactSeed',
  'persistContactContent',
  'removeContactContent',
  'ContactEditorForm',
] as const;

describe('AdminContact public API (SPEC R-3)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero barrel consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});
