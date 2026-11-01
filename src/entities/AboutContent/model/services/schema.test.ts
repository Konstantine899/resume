// Schema tests (TDD red → green, admin-about-table WU-10 / SPEC D10 v2).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import type { AboutContent } from '../types/types';
import { AboutContentEnvelopeSchema, AboutContentSchema } from './schema';

/** A valid document in the CURRENT (v2) shape. */
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

/**
 * The EXACT document the previous release persisted under
 * `resume.about.content` — tuple descriptions, four known stats, no
 * statLabels/portrait. It must validate WITHOUT a migration (D10:
 * v2 is a superset; the envelope stays `{ v: 1, content }`).
 */
const LEGACY_DOCUMENT = {
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

  it('accepts the legacy v1 document WITHOUT migration (envelope keeps v:1)', () => {
    expect(AboutContentEnvelopeSchema.safeParse({ v: 1, content: LEGACY_DOCUMENT }).success).toBe(
      true
    );
  });

  it('accepts an EMPTY descriptions array', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, descriptions: [] }).success).toBe(true);
  });

  it('accepts MORE than three descriptions (dynamic rows)', () => {
    const bad = {
      ...VALID,
      descriptions: [...VALID.descriptions, { en: 'Fourth paragraph.', ru: 'Четвёртый.' }],
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(true);
  });

  it('accepts a partial stats record — known keys are NOT mandatory (delete path)', () => {
    const stats = { ...VALID.stats };
    Reflect.deleteProperty(stats, 'aboutStatRemote');
    expect(AboutContentSchema.safeParse({ ...VALID, stats }).success).toBe(true);
  });

  it('accepts a custom stat key WITH its statLabel (add path)', () => {
    const parsed = AboutContentSchema.safeParse({
      ...VALID,
      stats: { ...VALID.stats, 'ships-weekly': { en: 'Ships weekly', ru: 'Релизы еженедельно' } },
      statLabels: { 'ships-weekly': { en: 'Ships weekly', ru: 'Релизы еженедельно' } },
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts statLabels ABSENT (optional field — old data has none)', () => {
    expect(AboutContentSchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts ctaLabel: null (deleted CTA row)', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, ctaLabel: null }).success).toBe(true);
  });

  it('accepts an optional portrait path', () => {
    expect(
      AboutContentSchema.safeParse({ ...VALID, portrait: '/images/about/portrait.png' }).success
    ).toBe(true);
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

  it('rejects a stat value over 60 chars', () => {
    const bad = {
      ...VALID,
      stats: { ...VALID.stats, aboutStatYears: { en: 'x'.repeat(61), ru: '6+ лет' } },
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an EMPTY stat key', () => {
    const stats = { ...VALID.stats, '': { en: 'No key', ru: 'Без ключа' } };
    expect(AboutContentSchema.safeParse({ ...VALID, stats }).success).toBe(false);
  });

  it('rejects a stat key over 40 chars', () => {
    const key = 'k'.repeat(41);
    const stats = { ...VALID.stats, [key]: { en: 'Long key', ru: 'Длинный ключ' } };
    expect(AboutContentSchema.safeParse({ ...VALID, stats }).success).toBe(false);
  });

  it('rejects a statLabel value over 60 chars', () => {
    const bad = {
      ...VALID,
      stats: { ...VALID.stats, custom: { en: 'ok', ru: 'ок' } },
      statLabels: { custom: { en: 'x'.repeat(61), ru: 'Метка' } },
    };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty ctaLabel locale', () => {
    const bad = { ...VALID, ctaLabel: { en: 'Hire Me', ru: '' } };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a ctaLabel over 40 chars per locale', () => {
    const bad = { ...VALID, ctaLabel: { en: 'x'.repeat(41), ru: 'Наймите Меня' } };
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a portrait over 260 chars', () => {
    const bad = { ...VALID, portrait: `/${'p'.repeat(260)}` }; // 261 chars
    expect(AboutContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-string portrait', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, portrait: 42 }).success).toBe(false);
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

describe('AboutContentSchema — stack (contract v3, SPEC E-4)', () => {
  it('accepts a document WITHOUT stack (legacy — field stays absent)', () => {
    const parsed = AboutContentSchema.safeParse(VALID);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.stack).toBeUndefined();
  });

  it('accepts stack keys and preserves DOCUMENT order', () => {
    const parsed = AboutContentSchema.safeParse({
      ...VALID,
      stack: ['react', 'nodejs', 'typescript'],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.stack).toEqual(['react', 'nodejs', 'typescript']);
  });

  it('accepts an EMPTY stack as intentionally empty (not undefined)', () => {
    const parsed = AboutContentSchema.safeParse({ ...VALID, stack: [] });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.stack).toEqual([]);
  });

  it('distinguishes [] from an absent stack at the contract level', () => {
    const empty = AboutContentSchema.safeParse({ ...VALID, stack: [] });
    const absent = AboutContentSchema.safeParse(VALID);
    expect(empty.success && absent.success).toBe(true);
    if (empty.success && absent.success) {
      expect(empty.data.stack).toEqual([]);
      expect(absent.data.stack).toBeUndefined();
      expect(empty.data.stack).not.toBe(absent.data.stack);
    }
  });

  it('accepts exactly 20 entries (cap boundary)', () => {
    const twenty = Array.from({ length: 20 }, (_, i) => `tech-${i}`);
    expect(AboutContentSchema.safeParse({ ...VALID, stack: twenty }).success).toBe(true);
  });

  it('rejects more than 20 entries', () => {
    const twentyOne = Array.from({ length: 21 }, (_, i) => `tech-${i}`);
    expect(AboutContentSchema.safeParse({ ...VALID, stack: twentyOne }).success).toBe(false);
  });

  it('rejects a non-slug stack key', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, stack: ['React JS'] }).success).toBe(false);
    expect(AboutContentSchema.safeParse({ ...VALID, stack: ['-leading'] }).success).toBe(false);
    expect(AboutContentSchema.safeParse({ ...VALID, stack: ['trailing-'] }).success).toBe(false);
  });

  it('rejects a non-string stack entry', () => {
    expect(AboutContentSchema.safeParse({ ...VALID, stack: [42] }).success).toBe(false);
  });

  it('accepts stack inside the envelope (v:1 untouched)', () => {
    expect(
      AboutContentEnvelopeSchema.safeParse({ v: 1, content: { ...VALID, stack: ['react'] } })
        .success
    ).toBe(true);
  });
});
