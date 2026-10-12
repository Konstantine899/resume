// Public-API + locale hygiene (admin-jobs-refactor WU-8 / SPEC R-8).
//
// The barrel may only re-export symbols that have a production consumer: six
// exports below were dead (zero importers across src/), so they are gone from
// `index.ts`. Their IMPLEMENTATIONS stay where they are — the slice/selector/
// storage unit tests import the modules directly and keep covering them.
// `adminJobPosition` (no En/Ru suffix) is the locale twin of that cleanup:
// the form labels two inputs with `adminJobPositionEn`/`adminJobPositionRu`
// and never asked for the single-label key.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = [
  'toggleCurrent',
  'applyJobToggle',
  'resetToDefaults',
  'removeJobs',
  'selectJobById',
  'selectCurrentJob',
] as const;

const LIVE_EXPORTS = [
  'addJob',
  'applyJobUpdate',
  'deleteJob',
  'jobsReducer',
  'makeJobRecord',
  'updateJob',
  'createJobsSeed',
  'selectAllJobs',
  'selectSortedJobs',
  'JOBS_STORAGE_KEY',
  'persistJobs',
  'readJobs',
  'JobForm',
  'JobsList',
] as const;

const LOCALES_DIR = resolve(__dirname, '../../shared/lib/i18n/locales');

const readLocale = (name: 'en' | 'ru'): Record<string, string> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${name}.json`), 'utf8'));

describe('AdminJobs public API (SPEC R-8)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero production consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});

describe('retired adminJobPosition locale key (SPEC R-8)', () => {
  it('is deleted from both locales', () => {
    expect(readLocale('en')).not.toHaveProperty('adminJobPosition');
    expect(readLocale('ru')).not.toHaveProperty('adminJobPosition');
  });

  it('keeps the suffixed labels the form actually renders', () => {
    for (const name of ['adminJobPositionEn', 'adminJobPositionRu']) {
      expect(readLocale('en'), `en ${name}`).toHaveProperty(name);
      expect(readLocale('ru'), `ru ${name}`).toHaveProperty(name);
    }
  });
});
