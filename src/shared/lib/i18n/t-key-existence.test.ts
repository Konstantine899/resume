// ==============================================
// t() key existence guard (issue #300)
// ==============================================
//
// Every STATIC string literal passed to t('...') anywhere in src/**/*.ts(x)
// must resolve to a real key in BOTH locales — a typo, or a key added to only
// one locale, ships a raw key to the UI. Historically (projectFieldImage /
// projectFieldTechIcons) that bug-class was caught only by manual preview
// smokes; this guard makes it red in CI.
//
// Source-level scan (the use[A-Z]\w* guard precedent,
// resume-code-executes-children): import.meta.glob with `?raw` returns the
// file texts directly (no fs, Windows-safe), comments are stripped FIRST
// (JSDoc examples contain t('...') pseudo-code that is NOT a call), and only
// fully static literals match — dynamic keys (t(someKey),
// t(`prefix${x}`)) are out of scope by design and are pinned in
// DYNAMIC_KEYS below when they carry real copy.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = resolve(__dirname, 'locales');

const readLocale = (name: 'en' | 'ru'): Record<string, string> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${name}.json`), 'utf8'));

const en = readLocale('en');
const ru = readLocale('ru');

// --------------------------------------------------
// Source scan
// --------------------------------------------------

// Fixtures legitimately call t() with arbitrary strings (the identity t-mock
// renders the key itself, so the locale content is irrelevant there).
const isFixture = (path: string): boolean =>
  path.includes('__tests__') || /\.(test|stories)\.[tj]sx?$/.test(path);

// Comments are NOT code: JSDoc/inline comments in this repo contain plenty of
// t('retry') / t('form.phone') pseudo-code that must not be scanned.
const stripComments = (source: string): string => {
  let out = '';
  let i = 0;
  let inStr: string | null = null;
  while (i < source.length) {
    const char = source[i] as string;
    const next = source[i + 1] as string | undefined;
    if (inStr !== null) {
      out += char;
      if (char === '\\') {
        out += next ?? '';
        i += 2;
        continue;
      }
      if (char === inStr) inStr = null;
      i += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inStr = char;
      out += char;
      i += 1;
      continue;
    }
    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    out += char;
    i += 1;
  }
  return out;
};

// t('key') / t("key") / t(`key`) — the backreference guards the closing quote,
// so interpolated template keys (t(`prefix${x}`)) never match: their inner
// text is not a bare identifier chain. The leading non-letter class skips
// identifiers such as useT( / at( / getToken(.
const STATIC_T_CALL = /[^a-zA-Z]t\(\s*(['"`])([a-zA-Z0-9][\w.-]*)\1/g;

// Dynamic key references that static t() scanning cannot see, but that carry
// real user-facing copy — pinned explicitly (each with its pattern):
// zod POSITIONAL messages (`.min(2, 'key')` — the key is not in a `message:`
// property, so the positional scan below misses it)…
const ZOD_POSITIONAL_KEYS = [
  'adminJobErrCompany', // AdminJobs JobForm/lib/jobFormSchema.ts  .min(2, …)
  'adminJobErrPosition', // AdminJobs JobForm/lib/fieldSchemas.ts  .min(3, …)
  'adminJobErrDescription', // AdminJobs JobForm/lib/jobFormSchema.ts  .max(200, …)
  'adminJobErrLocation', // AdminJobs JobForm/lib/fieldSchemas.ts  .min(2, …)
];
// …and ternary-derived labels (the literal is assigned to a variable and the
// variable — not the literal — reaches t()):
const TERNARY_DERIVED_KEYS = [
  'adminJobDescriptionEn', // AdminJobs JobForm.tsx  locale === 'en' ? … : …
  'adminJobDescriptionRu', // AdminJobs JobForm.tsx
  'adminTechKeyExists', // AdminTechnologies technologyFormSchema.ts  mode === 'edit' ? … : …
];
const DYNAMIC_KEYS = [...ZOD_POSITIONAL_KEYS, ...TERNARY_DERIVED_KEYS];

// i18next resolves t('key', { count }) through PLURAL-SUFFIXED variants:
// skillsCategoryCount ships only _one/_few/_many/_other, no bare key — a
// base key whose suffixed variants exist is therefore a valid resolution.
const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other'];
const resolves = (dict: Record<string, string>, key: string): boolean =>
  key in dict || PLURAL_SUFFIXES.some((suffix) => `${key}${suffix}` in dict);

// Schema/label properties that hold an i18n key as a bare camelCase string.
// Lowercase-first keeps dev-only sentences ('Success', error texts with
// spaces/punctuation) out; comments were stripped before this runs.
const I18N_KEY_PROPERTY = /\b(message|labelKey):\s*['"`]([a-z][a-zA-Z0-9]*)['"`]/g;

const toRepoPath = (globPath: string): string =>
  globPath.replace(/\\/g, '/').replace(/^\.\.\/\.\.\/\.\.\//, 'src/');

// `../../../` — THREE levels up: from src/shared/lib/i18n/ to src/.
const modules = import.meta.glob(['../../../**/*.ts', '../../../**/*.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// key → repo-relative files referencing it (static t() + message:/labelKey:).
const references = new Map<string, Set<string>>();
let staticLiteralCount = 0;
let scannedFileCount = 0;

for (const [globPath, source] of Object.entries(modules)) {
  if (isFixture(globPath)) continue;
  scannedFileCount += 1;
  const code = stripComments(source);

  for (const match of code.matchAll(STATIC_T_CALL)) {
    const key = match[2] as string;
    staticLiteralCount += 1;
    const files = references.get(key) ?? new Set<string>();
    files.add(toRepoPath(globPath));
    references.set(key, files);
  }

  for (const match of code.matchAll(I18N_KEY_PROPERTY)) {
    const key = match[2] as string;
    const files = references.get(key) ?? new Set<string>();
    files.add(toRepoPath(globPath));
    references.set(key, files);
  }
}

const collectFailures = (): string[] => {
  const failures: string[] = [];
  for (const [key, files] of [...references.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const missingIn = (['en', 'ru'] as const).filter(
      (loc) => !resolves(loc === 'en' ? en : ru, key)
    );
    if (missingIn.length > 0) {
      const sortedFiles = [...files].sort().join('\n      ');
      failures.push(
        `t('${key}') — missing in ${missingIn.join(' + ')}.json, referenced from:\n      ${sortedFiles}`
      );
    }
  }
  for (const key of DYNAMIC_KEYS) {
    const missingIn = (['en', 'ru'] as const).filter(
      (loc) => !resolves(loc === 'en' ? en : ru, key)
    );
    if (missingIn.length > 0) {
      failures.push(
        `dynamic key '${key}' — missing in ${missingIn.join(' + ')}.json (pinned in this file)`
      );
    }
  }
  return failures;
};

describe('t() key existence guard (issue #300)', () => {
  it('the scan is not vacuous — the matchers actually fired', () => {
    // Guard against a silently-broken matcher (glob path drift, regex
    // regression): today ~480 static literals across ~470 files reference
    // ~330 distinct keys, so anything near zero means the scan is dead and
    // every assertion below would pass vacuously.
    expect(scannedFileCount).toBeGreaterThan(100);
    expect(staticLiteralCount).toBeGreaterThan(100);
    expect(references.size).toBeGreaterThan(100);
  });

  it('every referenced key resolves in BOTH locales (static + pinned dynamic)', () => {
    const failures = collectFailures();
    expect(failures, `${failures.length} dead i18n key(s)`).toEqual([]);
  });
});
