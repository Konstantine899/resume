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
      'adminGateTitle',
      'adminLoginDev',
      'adminLogout',
      'adminComingSoon',
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
});
