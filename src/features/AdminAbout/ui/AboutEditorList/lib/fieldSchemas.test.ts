// fieldSchemas tests (admin-about-table WU-1)
//
// RED→GREEN contract for the nine per-field zod slices behind the About
// vitrina (SPEC R-3). Every slice DELEGATES its caps to the shared
// AboutContentSchema in entities (single source of truth for caps) while
// surfacing the form's existing i18n message keys — plus the merged-
// document save helper (snapshot → merge → persist → dispatch, SPEC R-3).

import { describe, expect, it } from 'vitest';

import { AboutContentSchema, type AboutContent } from '@/entities/AboutContent';
import {
  aboutFieldResolverSchema,
  aboutFieldSchema,
  defaultValuesFor,
  toMergedDocument,
  type EditAboutField,
} from './fieldSchemas';

/** The full document — every one of the 9 editable fields has data here. */
const baseDoc: AboutContent = {
  fullName: 'Константин',
  descriptions: [
    { en: 'Full-stack developer', ru: 'Фуллстек-разработчик' },
    { en: 'Clean architecture', ru: 'Чистая архитектура' },
    { en: 'Ten years of shipping', ru: 'Десять лет в проде' },
  ],
  stats: {
    aboutStatYears: { en: '10+ years', ru: '10+ лет' },
    aboutStatProjects: { en: '40+ projects', ru: '40+ проектов' },
    aboutStatUsers: { en: '1M+ users', ru: '1M+ пользователей' },
    aboutStatRemote: { en: 'Remote-first', ru: 'Удалёнка' },
  },
  ctaLabel: { en: 'Hire me', ru: 'Нанять' },
};

/** A valid value for each field kind (LocalizedText for every locale row). */
const validValueFor = (field: EditAboutField): string | { en: string; ru: string } =>
  field === 'fullName' ? 'Konstantin' : { en: 'text', ru: 'текст' };

/** Deep-freeze so any mutation of the fixture THROWS (ESM strict mode). */
const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
};

describe('aboutFieldSchema — fullName (scalar, contract trim + cap 80)', () => {
  it('valid roundtrip: trimmed by the contract ("  Ab  " → "Ab")', () => {
    const parsed = aboutFieldSchema('fullName').safeParse('  Ab  ');
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data).toBe('Ab');
  });

  it('empty and 1-char names are rejected with the aboutNameRequired key', () => {
    const empty = aboutFieldSchema('fullName').safeParse('');
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe('aboutNameRequired');
      expect(empty.error.issues[0]?.path).toEqual([]);
    }
    expect(aboutFieldSchema('fullName').safeParse('a').success).toBe(false);
    expect(aboutFieldSchema('fullName').safeParse('   ').success).toBe(false);
  });

  it('cap 80: exactly 80 passes, 81 is rejected with the same key', () => {
    expect(aboutFieldSchema('fullName').safeParse('x'.repeat(80)).success).toBe(true);
    const over = aboutFieldSchema('fullName').safeParse('x'.repeat(81));
    expect(over.success).toBe(false);
    if (!over.success) {
      expect(over.error.issues[0]?.message).toBe('aboutNameRequired');
    }
  });
});

describe('aboutFieldSchema — description-0..2 (LocalizedText, contract cap 600)', () => {
  it('valid roundtrip: 600 chars per locale passes for every index', () => {
    const value = { en: 'x'.repeat(600), ru: 'у'.repeat(600) };
    for (const field of ['description-0', 'description-1', 'description-2'] as const) {
      const parsed = aboutFieldSchema(field).safeParse(value);
      expect(parsed.success).toBe(true);
      expect(parsed.success && parsed.data).toEqual(value);
    }
  });

  it('over-cap locale is rejected on the FAILING side (en and ru) with aboutParagraphEmpty', () => {
    const enOver = aboutFieldSchema('description-1').safeParse({
      en: 'x'.repeat(601),
      ru: 'текст',
    });
    expect(enOver.success).toBe(false);
    if (!enOver.success) {
      expect(enOver.error.issues[0]?.path).toEqual(['en']);
      expect(enOver.error.issues[0]?.message).toBe('aboutParagraphEmpty');
    }
    const ruOver = aboutFieldSchema('description-1').safeParse({
      en: 'text',
      ru: 'у'.repeat(601),
    });
    expect(ruOver.success).toBe(false);
    if (!ruOver.success) {
      expect(ruOver.error.issues[0]?.path).toEqual(['ru']);
      expect(ruOver.error.issues[0]?.message).toBe('aboutParagraphEmpty');
    }
  });

  it('empty locale is rejected (contract min 1); whitespace-only is NOT (contract has no trim)', () => {
    const empty = aboutFieldSchema('description-0').safeParse({ en: '', ru: 'текст' });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toBe('aboutParagraphEmpty');
    }
    expect(aboutFieldSchema('description-0').safeParse({ en: '   ', ru: 'текст' }).success).toBe(
      true
    );
  });
});

describe('aboutFieldSchema — stat-0..3 (LocalizedText, contract cap 60)', () => {
  it('valid roundtrip: 60 chars per locale passes for all four stat indices', () => {
    const value = { en: 'x'.repeat(60), ru: 'у'.repeat(60) };
    for (const field of ['stat-0', 'stat-1', 'stat-2', 'stat-3'] as const) {
      const parsed = aboutFieldSchema(field).safeParse(value);
      expect(parsed.success).toBe(true);
      expect(parsed.success && parsed.data).toEqual(value);
    }
  });

  it('over-cap locale is rejected (en and ru) with aboutStatRequired', () => {
    const enOver = aboutFieldSchema('stat-2').safeParse({ en: 'x'.repeat(61), ru: 'ок' });
    expect(enOver.success).toBe(false);
    if (!enOver.success) {
      expect(enOver.error.issues[0]?.path).toEqual(['en']);
      expect(enOver.error.issues[0]?.message).toBe('aboutStatRequired');
    }
    const ruOver = aboutFieldSchema('stat-2').safeParse({ en: 'ok', ru: 'у'.repeat(61) });
    expect(ruOver.success).toBe(false);
    if (!ruOver.success) {
      expect(ruOver.error.issues[0]?.path).toEqual(['ru']);
      expect(ruOver.error.issues[0]?.message).toBe('aboutStatRequired');
    }
  });
});

describe('aboutFieldSchema — ctaLabel (LocalizedText, contract cap 40)', () => {
  it('valid roundtrip at the 40 cap; 41 is rejected with aboutCtaRequired', () => {
    const atCap = { en: 'x'.repeat(40), ru: 'у'.repeat(40) };
    const parsed = aboutFieldSchema('ctaLabel').safeParse(atCap);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data).toEqual(atCap);

    const over = aboutFieldSchema('ctaLabel').safeParse({ en: 'x'.repeat(41), ru: 'ок' });
    expect(over.success).toBe(false);
    if (!over.success) {
      expect(over.error.issues[0]?.message).toBe('aboutCtaRequired');
    }
  });
});

describe('EditAboutField union — all 9 fields resolve a schema', () => {
  const ALL_FIELDS: EditAboutField[] = [
    'fullName',
    'description-0',
    'description-1',
    'description-2',
    'stat-0',
    'stat-1',
    'stat-2',
    'stat-3',
    'ctaLabel',
  ];

  it('every member parses a valid value (schema record is complete)', () => {
    expect(ALL_FIELDS).toHaveLength(9);
    for (const field of ALL_FIELDS) {
      const parsed = aboutFieldSchema(field).safeParse(validValueFor(field));
      expect(parsed.success, `${field} should parse`).toBe(true);
    }
  });
});

describe('defaultValuesFor — document → per-field form values', () => {
  it('fullName and ctaLabel return their exact values', () => {
    expect(defaultValuesFor('fullName', baseDoc)).toEqual({ fullName: baseDoc.fullName });
    expect(defaultValuesFor('ctaLabel', baseDoc)).toEqual({ ctaLabel: { ...baseDoc.ctaLabel } });
  });

  it('description-N returns the indexed paragraph (cloned — never a shared reference)', () => {
    const values = defaultValuesFor('description-1', baseDoc);
    expect(values).toEqual({ description: { ...baseDoc.descriptions[1] } });
    expect(values.description).not.toBe(baseDoc.descriptions[1]);
  });

  it('stat-N maps indices onto the four StatKeys in document order', () => {
    const order = [
      baseDoc.stats.aboutStatYears,
      baseDoc.stats.aboutStatProjects,
      baseDoc.stats.aboutStatUsers,
      baseDoc.stats.aboutStatRemote,
    ] as const;
    for (let index = 0; index < order.length; index += 1) {
      const values = defaultValuesFor(`stat-${index}` as EditAboutField, baseDoc);
      expect(values).toEqual({ stat: { ...order[index] } });
      expect(values.stat).not.toBe(order[index]);
    }
  });
});

describe('toMergedDocument — ONE field replaced, siblings byte-identical', () => {
  it('description-1 swaps only that paragraph', () => {
    const next = { en: 'New pitch', ru: 'Новый питч' };
    const merged = toMergedDocument(baseDoc, 'description-1', next);
    expect(merged.descriptions[1]).toEqual(next);
    expect(merged.descriptions[0]).toEqual(baseDoc.descriptions[0]);
    expect(merged.descriptions[2]).toEqual(baseDoc.descriptions[2]);
    expect(merged.fullName).toBe(baseDoc.fullName);
    expect(merged.stats).toEqual(baseDoc.stats);
    expect(merged.ctaLabel).toEqual(baseDoc.ctaLabel);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('stat-2 swaps only its stat key; the other three keep their values', () => {
    const next = { en: '60 projects', ru: '60 проектов' };
    const merged = toMergedDocument(baseDoc, 'stat-2', next);
    expect(merged.stats.aboutStatUsers).toEqual(next);
    expect(merged.stats.aboutStatYears).toEqual(baseDoc.stats.aboutStatYears);
    expect(merged.stats.aboutStatProjects).toEqual(baseDoc.stats.aboutStatProjects);
    expect(merged.stats.aboutStatRemote).toEqual(baseDoc.stats.aboutStatRemote);
    expect(merged.descriptions).toEqual(baseDoc.descriptions);
    expect(merged.fullName).toBe(baseDoc.fullName);
    expect(merged.ctaLabel).toEqual(baseDoc.ctaLabel);
  });

  it('fullName swaps only the scalar', () => {
    const merged = toMergedDocument(baseDoc, 'fullName', 'Константин Иванов');
    expect(merged.fullName).toBe('Константин Иванов');
    expect(merged.descriptions).toEqual(baseDoc.descriptions);
    expect(merged.stats).toEqual(baseDoc.stats);
    expect(merged.ctaLabel).toEqual(baseDoc.ctaLabel);
  });

  it('ctaLabel swaps only the label', () => {
    const next = { en: 'Work with me', ru: 'Работать вместе' };
    const merged = toMergedDocument(baseDoc, 'ctaLabel', next);
    expect(merged.ctaLabel).toEqual(next);
    expect(merged.fullName).toBe(baseDoc.fullName);
    expect(merged.descriptions).toEqual(baseDoc.descriptions);
    expect(merged.stats).toEqual(baseDoc.stats);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('does NOT mutate base (deep-frozen fixture) and returns a NEW document', () => {
    const frozen = deepFreeze(structuredClone(baseDoc));
    const merged = toMergedDocument(frozen, 'stat-0', { en: '5 years', ru: '5 лет' });
    expect(merged).not.toBe(frozen);
    expect(frozen).toEqual(baseDoc);
  });
});

describe('aboutFieldResolverSchema — RHF resolver entry (WU-4)', () => {
  it('wraps the scalar slice under the value key (fullName)', () => {
    const parsed = aboutFieldResolverSchema('fullName').safeParse({ fullName: '  Ab  ' });
    expect(parsed.success).toBe(true);
    // The resolver output carries the TRIMMED value (contract transform).
    expect(parsed.data?.fullName).toBe('Ab');
  });

  it('wraps the LocalizedText slices under description/stat/ctaLabel', () => {
    expect(
      aboutFieldResolverSchema('description-1').safeParse({
        description: { en: 'ok', ru: 'ок' },
      }).success
    ).toBe(true);
    expect(
      aboutFieldResolverSchema('stat-2').safeParse({ stat: { en: 'ok', ru: 'ок' } }).success
    ).toBe(true);
    expect(
      aboutFieldResolverSchema('ctaLabel').safeParse({ ctaLabel: { en: 'ok', ru: 'ок' } }).success
    ).toBe(true);
  });

  it('nests failures under the value key (errors.<key>.<locale> lookups)', () => {
    const parsed = aboutFieldResolverSchema('description-0').safeParse({
      description: { en: '', ru: 'ок' },
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['description', 'en']);
      expect(parsed.error.issues[0]?.message).toBe('aboutParagraphEmpty');
    }
  });

  it('fullName failures surface under errors.fullName', () => {
    const parsed = aboutFieldResolverSchema('fullName').safeParse({ fullName: 'a' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['fullName']);
      expect(parsed.error.issues[0]?.message).toBe('aboutNameRequired');
    }
  });
});
