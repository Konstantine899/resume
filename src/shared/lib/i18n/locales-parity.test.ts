// ============================================
// Locale parity invariant (plan WU-6, admin-panel)
// ============================================
//
// en/ru must always expose the SAME key set with non-empty values — deleting
// or renaming one side silently ships raw keys to the UI. Read from disk (the
// theme-tokens/keyframes precedent): jsdom never loads the JSON through the
// i18n runtime, and the source files are the artifact under test.
//
// Issue #300 (i18n invariants) extends this file with the two whole-set
// invariants that supersede the old pinned `adminKeys` list:
//   1. placeholder parity for EVERY key carrying {{…}} (a one-sided
//      placeholder ships a literal `{{name}}` in the other language);
//   2. non-emptiness for EVERY value outside a tiny explicit allowlist.
// Key EXISTENCE for rendered copy is guarded by t-key-existence.test.ts
// (static t('…') scan + pinned dynamic keys), which covers strictly more
// than the old list did.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SEED_RU_TEXTS } from './locales/seedTexts';

const LOCALES_DIR = resolve(__dirname, 'locales');

const readLocale = (name: 'en' | 'ru'): Record<string, string> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${name}.json`), 'utf8'));

const en = readLocale('en');
const ru = readLocale('ru');

// The ONLY legitimately-empty values: an empty alt text is the ACCESSIBLE
// choice for decorative images (imageAltDecorative). Anything else empty is
// a broken translation — keep this allowlist tiny and justified.
const ALLOWED_EMPTY = new Set(['imageAltDecorative']);

// Placeholder-name extraction: `{{name}}`, tolerant of inner whitespace.
const PLACEHOLDER = /\{\{\s*([\w.-]+)\s*\}\}/g;

const placeholderNames = (value: string): string[] =>
  [...value.matchAll(PLACEHOLDER)].map((match) => match[1] as string).sort();

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

  it('no value is empty outside the explicit allowlist (issue #300)', () => {
    // Whole-set successor of the old adminKeys emptiness loop: instead of 130
    // pinned keys, EVERY value on both sides must carry real copy — an empty
    // translation renders nothing with no test going red.
    for (const [loc, dict] of [
      ['en', en],
      ['ru', ru],
    ] as const) {
      const unexpectedEmpty = Object.entries(dict)
        .filter(([key, value]) => value.trim() === '' && !ALLOWED_EMPTY.has(key))
        .map(([key]) => key)
        .sort();
      expect(unexpectedEmpty, `${loc} unexpectedly empty values`).toEqual([]);
    }

    // The allowlist must stay honest: entries must exist and must actually BE
    // empty — otherwise delete them from the allowlist instead of growing it.
    for (const key of ALLOWED_EMPTY) {
      expect(en, `allowlisted ${key} missing from en`).toHaveProperty(key);
      expect(ru, `allowlisted ${key} missing from ru`).toHaveProperty(key);
      expect((en[key] ?? '').trim(), `allowlisted ${key} is no longer empty in en`).toBe('');
      expect((ru[key] ?? '').trim(), `allowlisted ${key} is no longer empty in ru`).toBe('');
    }
  });

  it('every key with {{placeholders}} carries the same placeholder names in ru (issue #300)', () => {
    // Whole-set successor of the old aboutResetConfirm point test: a one-sided
    // placeholder ships a literal `{{name}}` in the other language. A missing
    // ru key collapses to '' via ?? and fails the comparison anyway.
    const enWithPlaceholders = Object.entries(en).filter(
      ([, value]) => placeholderNames(value).length > 0
    );
    // Vacuous-scan guard: the matcher must actually fire (aboutResetConfirm,
    // skillsConfirmDelete*, paginationRange… carry placeholders today).
    expect(enWithPlaceholders.length).toBeGreaterThan(0);

    for (const [key, value] of Object.entries(en)) {
      expect(placeholderNames(ru[key] ?? ''), `ru.${key} placeholder names differ from en`).toEqual(
        placeholderNames(value)
      );
    }
  });

  it('no value carries corrupted {{ }} constructs (issue #300)', () => {
    // Catches what the parity loop above cannot: a malformed construct that
    // matches on NEITHER side ({{name, {{name }}, {{na{me}}}) still renders
    // as visible braces garbage in the UI.
    for (const [loc, dict] of [
      ['en', en],
      ['ru', ru],
    ] as const) {
      for (const [key, value] of Object.entries(dict)) {
        const opens = (value.match(/\{\{/g) ?? []).length;
        const closes = (value.match(/\}\}/g) ?? []).length;
        expect(opens, `${loc}.${key}: unbalanced {{ / }} in "${value}"`).toBe(closes);

        // After removing every well-formed {{name}} token, nothing may remain
        // that still looks like an opener/closer — that residue is a broken
        // construct i18next will NOT interpolate.
        const residue = (value.match(PLACEHOLDER) ?? []).reduce(
          (rest, token) => rest.replace(token, ''),
          value
        );
        expect(
          residue.includes('{{') || residue.includes('}}'),
          `${loc}.${key}: malformed placeholder in "${value}"`
        ).toBe(false);
      }
    }
  });

  it('the retired adminJobPosition key stays deleted (admin-jobs-refactor WU-8)', () => {
    // The form renders two locale inputs labelled adminJobPositionEn/Ru —
    // the single-label `adminJobPosition` had no consumer (SPEC R-8), so it
    // must not creep back into either locale.
    expect(en).not.toHaveProperty('adminJobPosition');
    expect(ru).not.toHaveProperty('adminJobPosition');
  });

  it('the retired URL-input keys stay deleted (tech-icon-upload A5)', () => {
    // The iconUrl Input is gone — its label and the https-validation copy
    // have no consumer anymore and must not creep back into either locale.
    expect(en).not.toHaveProperty('adminTechIconUrlLabel');
    expect(ru).not.toHaveProperty('adminTechIconUrlLabel');
    expect(en).not.toHaveProperty('adminTechUrlInvalid');
    expect(ru).not.toHaveProperty('adminTechUrlInvalid');
  });
});

describe('static RU seed texts (lazy ru locale, issue #298)', () => {
  // The ru locale bundle loads lazily, so the About/Contact seeds carry
  // their ru copy statically (locales/seedTexts.ts). This is the DRIFT
  // GUARD for that copy: every entry must equal ru.json verbatim and have
  // its en counterpart (the seed pairs the two). The feature seed.test.ts
  // files close the loop from the other side: create*Seed() ≡ ru.json.
  it('every RU seed text equals its ru.json value (no silent drift)', () => {
    const entries = Object.entries(SEED_RU_TEXTS);
    // Non-vacuous: today 22 entries (8 About + 14 Contact).
    expect(entries.length).toBeGreaterThanOrEqual(22);

    for (const [key, value] of entries) {
      expect(ru[key], `ru.${key} drifted from SEED_RU_TEXTS`).toBe(value);
      expect(en, `en.${key} missing (the seed pairs it with the ru text)`).toHaveProperty(key);
    }
  });
});
