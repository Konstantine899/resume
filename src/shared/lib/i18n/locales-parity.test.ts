// ============================================
// Locale parity invariant (plan WU-6, admin-panel)
// ============================================
//
// en/ru must always expose the SAME key set with non-empty values, and the
// admin keys wired up by WU-1..WU-5 must exist — deleting or renaming one
// side silently ships raw keys to the UI. Read from disk (the
// theme-tokens/keyframes precedent): jsdom never loads the JSON through the
// i18n runtime, and the source files are the artifact under test.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = resolve(__dirname, 'locales');

const readLocale = (name: 'en' | 'ru'): Record<string, string> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${name}.json`), 'utf8'));

const en = readLocale('en');
const ru = readLocale('ru');

describe('locale parity (WU-6)', () => {
  it('en and ru expose exactly the same key set', () => {
    const enKeys = Object.keys(en).sort();
    const ruKeys = Object.keys(ru).sort();

    expect(ruKeys.filter((key) => !enKeys.includes(key))).toEqual([]); // ru-only keys
    expect(enKeys.filter((key) => !ruKeys.includes(key))).toEqual([]); // en-only keys
    expect(ruKeys).toEqual(enKeys);
  });

  it('every value on both sides is a string, with emptiness kept in parity', () => {
    // Empty values are legitimate for decorative alt text (imageAltDecorative
    // = "" — an empty alt is the ACCESSIBLE choice), so the invariant is
    // "same shape both sides", not "never empty".
    for (const [key, value] of Object.entries(en)) {
      expect(typeof value, `en.${key}`).toBe('string');
    }
    for (const [key, value] of Object.entries(ru)) {
      expect(typeof value, `ru.${key}`).toBe('string');
    }

    const enEmpty = Object.entries(en)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key)
      .sort();
    const ruEmpty = Object.entries(ru)
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key)
      .sort();
    expect(ruEmpty).toEqual(enEmpty);
  });

  it('the admin keys used by WU-1..WU-5 exist on both sides', () => {
    const adminKeys = [
      'adminBackToSite',
      'adminNavLabel',
      'adminNavDashboard',
      'adminNavSettings',
      'adminSettings',
      'adminDashboardEmpty',
      'adminMetricProjects',
      'adminMetricSkills',
      'adminMetricSections',
      'adminLogout',
      'adminComingSoon',
      // About CRUD stage-1 (plan_about_crud §10 WU-3) — all 16 keys.
      'adminNavAbout',
      'adminAboutTitle',
      'adminAboutHint',
      'aboutFieldFullName',
      'aboutFieldDescriptions',
      'aboutFieldStats',
      'aboutFieldCta',
      'aboutSave',
      'aboutReset',
      'aboutSaved',
      'aboutSaveError',
      'aboutResetConfirm',
      'aboutNameRequired',
      'aboutParagraphEmpty',
      'aboutStatRequired',
      'aboutCtaRequired',
      // Contact CRUD stage-1 (plan_contact_crud §10 WU-3) — all 14 keys.
      'adminNavContact',
      'adminContactTitle',
      'adminContactHint',
      'adminFieldEmail',
      'adminFieldTexts',
      'adminFieldFormTexts',
      'contactSave',
      'contactReset',
      'contactSaved',
      'contactSaveError',
      'contactResetConfirm',
      'contactEmailInvalid',
      'contactTextEmpty',
      'contactFormTextEmpty',
      // WorkHistory CRUD stage-1 (plan_workhistory_crud WU-3) — 14 plan keys
      // + adminNavJobs (the plan's key lists omit the nav label, but every
      // other admin section ships an adminNav* key and WU-5's sidebar entry
      // follows the same pattern).
      'workHistoryEmpty',
      'adminJobs',
      'adminAddJob',
      'adminEditJob',
      'adminJobsEmpty',
      'adminNavJobs',
      'adminJobErrCompany',
      'adminJobErrPosition',
      'adminJobErrStartDate',
      'adminJobErrEndDate',
      'adminJobErrDescription',
      'adminJobErrTechnologies',
      'adminJobErrLocation',
      'adminJobErrUrl',
      'adminJobErrEnum',
      // WU-5 form + list copy: the plan's WU-5 keys (the four admin basics
      // shipped in WU-3) + adminJobPositionEn/Ru — the plan lists one
      // adminJobPosition, but the form has two locale inputs
      // (position.en / position.ru) and each needs its label, so the single
      // label was never rendered and admin-jobs-refactor WU-8 (SPEC R-8)
      // deleted it as dead copy.
      'adminJobCompany',
      'adminJobPositionEn',
      'adminJobPositionRu',
      'adminJobStartDate',
      'adminJobEndDate',
      'adminJobCurrent',
      'adminJobDescription',
      'adminJobTechnologies',
      'adminJobLocation',
      'adminJobEmploymentType',
      'adminJobLevel',
      'adminJobCompanyUrl',
      'adminJobFeatured',
      'adminJobAddBullet',
      'adminJobRemoveBullet',
      // Editor affordances beyond the plan's list: bullet reorder needs
      // i18n aria-labels, the two description blocks need visible per-locale
      // headings, and the chip editor has add/remove controls.
      'adminJobBulletUp',
      'adminJobBulletDown',
      'adminJobDescriptionEn',
      'adminJobDescriptionRu',
      'adminJobAddTech',
      'adminJobRemoveTech',
      'adminJobSave',
      // Not in the plan's 33-key list — the Save/Cancel row and the Modal
      // confirm both need it (Skills reuses skillsCancel; jobs stays
      // self-contained instead of borrowing another feature's key).
      'adminJobCancel',
      'adminJobDelete',
      'adminJobConfirmDelete',
      // admin-jobs-refactor WU-3 (SPEC R-3): confirm subtitle NAMES the
      // company (SkillsEditorList OPEN-10 parity).
      'adminJobConfirmDeleteName',
      // admin-jobs-refactor WU-6 (SPEC R-6): DataTable column headers.
      'adminJobsTableCompany',
      'adminJobsTablePosition',
      'adminJobsTablePeriod',
      'adminJobsTableFlags',
      'adminJobsTableActions',
      'adminJobSaved',
      'adminJobDeleted',
      'adminJobPersistError',
    ];

    for (const key of adminKeys) {
      expect(en, `en missing ${key}`).toHaveProperty(key);
      expect(ru, `ru missing ${key}`).toHaveProperty(key);
      // `?? ''`: toHaveProperty already asserted existence above — here we only
      // guard the noUncheckedIndexedAccess index access; a missing key would
      // collapse to '' and fail the emptiness assertion anyway.
      expect((en[key] ?? '').trim(), `en ${key} empty`).not.toBe('');
      expect((ru[key] ?? '').trim(), `ru ${key} empty`).not.toBe('');
    }
  });

  it('the retired adminJobPosition key stays deleted (admin-jobs-refactor WU-8)', () => {
    // The form renders two locale inputs labelled adminJobPositionEn/Ru —
    // the single-label `adminJobPosition` had no consumer (SPEC R-8), so it
    // must not creep back into either locale.
    expect(en).not.toHaveProperty('adminJobPosition');
    expect(ru).not.toHaveProperty('adminJobPosition');
  });
});
