// Seed tests (plan About CRUD §5 + R-8: seed must BE the current locales).

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEVELOPER_DATA } from '@/entities/Developer';
// Public API only (fsd-imports/tests-public-api-only): the bundled en locale
// the i18n instance reads, exposed as `resources`.
import { resources } from '@/shared/lib/i18n';

import { AboutContentSchema } from '@/entities/AboutContent';
import { createAboutSeed } from './seed';

const en = resources.en.translation;
// ru reads from DISK, not the runtime bundle: the ru locale is lazy (issue
// #298) and locales-parity.test.ts drift-locks SEED_RU_TEXTS to ru.json —
// the seed must equal the ON-DISK ru.json either way (artifact-under-test
// precedent, the same readFileSync the parity/invariant tests use).
const ru: Record<string, string> = JSON.parse(
  readFileSync(join(resolve(__dirname, '../../../../shared/lib/i18n/locales'), 'ru.json'), 'utf8')
);

describe('createAboutSeed', () => {
  it('takes fullName from DEVELOPER_DATA (single source for the h1)', () => {
    expect(createAboutSeed().fullName).toBe(DEVELOPER_DATA.fullName);
  });

  it('paragraphs equal the current locale values (drift guard, R-8)', () => {
    const { descriptions } = createAboutSeed();
    expect(descriptions).toEqual([
      { en: en.aboutDescription, ru: ru.aboutDescription },
      { en: en.aboutDescription2, ru: ru.aboutDescription2 },
      { en: en.aboutDescription3, ru: ru.aboutDescription3 },
    ]);
  });

  it('stats equal the current locale values (drift guard, R-8)', () => {
    expect(createAboutSeed().stats).toEqual({
      aboutStatYears: { en: en.aboutStatYears, ru: ru.aboutStatYears },
      aboutStatProjects: { en: en.aboutStatProjects, ru: ru.aboutStatProjects },
      aboutStatUsers: { en: en.aboutStatUsers, ru: ru.aboutStatUsers },
      aboutStatRemote: { en: en.aboutStatRemote, ru: ru.aboutStatRemote },
    });
  });

  it('ctaLabel equals the current locale value (drift guard, R-8)', () => {
    expect(createAboutSeed().ctaLabel).toEqual({ en: en.getInTouch, ru: ru.getInTouch });
  });

  it('always produces a schema-valid document (locales can never exceed limits)', () => {
    expect(AboutContentSchema.safeParse(createAboutSeed()).success).toBe(true);
  });

  it('returns a fresh object each call (no shared mutable state)', () => {
    const a = createAboutSeed();
    const b = createAboutSeed();
    expect(a).not.toBe(b);
    a.fullName = 'mutated';
    expect(b.fullName).toBe(DEVELOPER_DATA.fullName);
  });
});
