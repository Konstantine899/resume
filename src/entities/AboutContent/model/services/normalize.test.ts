import { describe, expect, it } from 'vitest';

import { normalizeAboutPayload, extractAboutRevision } from './normalize';
import { AboutContentSchema } from './schema';

describe('normalizeAboutPayload', () => {
  it('keeps only the six domain fields and strips transport keys', () => {
    const raw = {
      id: 'about-1',
      updatedAt: 'rev-1',
      expectedUpdatedAt: 'rev-0',
      arbitrary: 'nope',
      fullName: 'Ada Lovelace',
      descriptions: [{ en: 'Hello', ru: 'Привет' }],
      stats: { aboutStatYears: { en: '5', ru: '5' } },
      statLabels: {},
      ctaLabel: { en: 'Hire me', ru: 'Найми меня' },
      portrait: 'about/portrait.jpg',
    };

    expect(normalizeAboutPayload(raw)).toEqual({
      fullName: 'Ada Lovelace',
      descriptions: [{ en: 'Hello', ru: 'Привет' }],
      stats: { aboutStatYears: { en: '5', ru: '5' } },
      statLabels: {},
      ctaLabel: { en: 'Hire me', ru: 'Найми меня' },
      portrait: 'about/portrait.jpg',
    });
  });

  it('rejects malformed payloads', () => {
    expect(normalizeAboutPayload({ fullName: 'Ada' })).toBeUndefined();
    expect(normalizeAboutPayload(null)).toBeUndefined();
    expect(normalizeAboutPayload('not-an-object')).toBeUndefined();
    expect(normalizeAboutPayload([])).toBeUndefined();
  });

  it('strips arbitrary keys via the allowlist', () => {
    const raw = {
      fullName: 'Ada Lovelace',
      descriptions: [],
      stats: {},
      ctaLabel: { en: 'Hire me', ru: 'Найми меня' },
      sneaky: 42,
    };

    expect(normalizeAboutPayload(raw)).toEqual({
      fullName: 'Ada Lovelace',
      descriptions: [],
      stats: {},
      ctaLabel: { en: 'Hire me', ru: 'Найми меня' },
    });
  });

  it('returns undefined when schema caps are violated', () => {
    const raw = {
      fullName: 'A',
      descriptions: [],
      stats: {},
      ctaLabel: { en: 'Hire me', ru: 'Найми меня' },
    };

    expect(normalizeAboutPayload(raw)).toBeUndefined();
  });

  it('exposes the zod-inferred output type', () => {
    const value = normalizeAboutPayload({
      fullName: 'Ada Lovelace',
      descriptions: [],
      stats: {},
      ctaLabel: null,
    });

    expect(value).toBeDefined();
    expect(AboutContentSchema.strict().safeParse(value).success).toBe(true);
  });
});

describe('extractAboutRevision', () => {
  it('reads updatedAt and trims it', () => {
    expect(extractAboutRevision({ updatedAt: '  rev-1  ' })).toBe('rev-1');
  });

  it('rejects non-string or empty values', () => {
    expect(extractAboutRevision({ updatedAt: '' })).toBeNull();
    expect(extractAboutRevision({ updatedAt: '   ' })).toBeNull();
    expect(extractAboutRevision({ updatedAt: 42 })).toBeNull();
    expect(extractAboutRevision(null)).toBeNull();
    expect(extractAboutRevision({})).toBeNull();
  });
});
