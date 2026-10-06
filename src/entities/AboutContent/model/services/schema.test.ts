// Schema tests (TDD red → green, plan About CRUD §7 + §5 envelope).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import type { AboutContent } from '../types/types';
import { AboutContentEnvelopeSchema, AboutContentSchema } from './schema';

const VALID: AboutContent = {
  fullName: 'Атрощенко Константин',
  descriptions: [
    { en: 'First paragraph.', ru: 'Первый абзац.' },
    { en: 'Second paragraph.', ru: 'Второй абзац.' },
    { en: 'Third paragraph.', ru: 'Третий абзац.' },
  ],
  stats: {
    aboutStatYears: { en: '6+ years', ru: '6+ лет' },
    aboutStatProjects: { en: '7+ projects', ru: '7+ проектов' },
    aboutStatUsers: { en: '1M+ users', ru: '1M+ пользователей' },
    aboutStatRemote: { en: 'Remote-friendly', ru: 'Готов к удалённой работе' },
  },
  ctaLabel: { en: 'Hire Me', ru: 'Наймите Меня' },
};

describe('AboutContentSchema', () => {
  it('accepts a valid document', () => {
    expect(AboutContentSchema.safeParse(VALID).success).toBe(true);
  });

  it('output is assignable to AboutContent (contract compatibility)', () => {
    const parsed = AboutContentSchema.parse(VALID);
    const typed: AboutContent = parsed;
    expect(typed.fullName).toBe('Атрощенко Константин');
  });

  it('rejects fullName shorter than 2 chars after trim', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, fullName: ' A ' }).success).toBe(false);
  });

  it('rejects fullName longer than 80 chars', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, fullName: 'x'.repeat(81) }).success).toBe(
      false
    );
  });

  it('rejects an empty paragraph locale', () => {
    const bad = {
      ...VALID,
      descriptions: [{ en: '', ru: 'Абзац.' }, VALID.descriptions[1], VALID.descriptions[2]],
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a paragraph over 600 chars', () => {
    const bad = {
      ...VALID,
      descriptions: [
        { en: 'x'.repeat(601), ru: 'Абзац.' },
        VALID.descriptions[1],
        VALID.descriptions[2],
      ],
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a descriptions array that is not a 3-tuple', () => {
    const bad = { ...VALID, descriptions: [VALID.descriptions[0]] };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a stat value over 60 chars', () => {
    const bad = {
      ...VALID,
      stats: { ...VALID.stats, aboutStatYears: { en: 'x'.repeat(61), ru: '6+ лет' } },
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects stats with a missing key', () => {
    const stats = { ...VALID.stats };
    Reflect.deleteProperty(stats, 'aboutStatRemote');
    expect(AboutContentSchema.safeParse({ ...VALID, stats }).success).toBe(false);
  });

  it('rejects an empty ctaLabel locale', () => {
    const bad = { ...VALID, ctaLabel: { en: 'Hire Me', ru: '' } };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a ctaLabel over 40 chars per locale', () => {
    const bad = { ...VALID, ctaLabel: { en: 'x'.repeat(41), ru: 'Наймите Меня' } };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });
});

describe('AboutContentEnvelopeSchema', () => {
  it('accepts { v: 1, content } with a valid document', () => {
    expect(AboutContentEnvelopeSchema.safeParse({ v: 1, content: VALID }).success).toBe(true);
  });

  it('rejects an unknown version (future migration guard)', () => {
    expect(AboutContentEnvelopeSchema.safeParse({ v: 2, content: VALID }).success).toBe(false);
  });

  it('rejects a missing content field', () => {
    expect(AboutContentEnvelopeSchema.safeParse({ v: 1 }).success).toBe(false);
  });

  it('rejects an invalid document inside the envelope', () => {
    expect(
      AboutContentEnvelopeSchema.safeParse({ v: 1, content: { ...VALID, fullName: '' } }).success
    ).toBe(false);
  });
});
