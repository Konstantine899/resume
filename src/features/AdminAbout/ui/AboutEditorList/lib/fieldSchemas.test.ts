// fieldSchemas tests (admin-about-table WU-1/WU-12)
//
// RED→GREEN contract for the per-field zod slices behind the About
// vitrina (SPEC R-3/R-4 + amendment R-1/R-2/R-3). Every slice DELEGATES
// its caps to the shared AboutContentSchema in entities (single source of
// truth for caps) while surfacing the form's existing i18n message keys —
// plus the merged-document helpers (edit / add / remove a row, SPEC R-2/R-3).
//
// WU-12 (amendment): field addresses are DYNAMIC — `description-<any index>`
// and `stat-<record key>` (NOT a positional 0..3), so the schema entry is a
// dispatch (factories), never a static 9-field record.

import { describe, expect, it } from 'vitest';

import { AboutContentSchema, type AboutContent } from '@/entities/AboutContent';
import {
  aboutFieldResolverSchema,
  aboutFieldSchema,
  aboutRowResolverSchema,
  defaultValuesFor,
  descriptionIndexOf,
  slugFromLabel,
  statKeyOf,
  toMergedDocument,
  withAddedRow,
  withRemovedRow,
  type AboutRowPayload,
  type EditAboutField,
} from './fieldSchemas';

/** The full document — descriptions + stats (known and custom) + cta. */
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
    'full-stack': { en: '10 years', ru: '10 лет' },
  },
  statLabels: {
    'full-stack': { en: 'Full Stack', ru: 'Фулл-стек' },
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

describe('aboutFieldSchema — description rows (LocalizedText, contract cap 600)', () => {
  it('valid roundtrip: 600 chars per locale passes for ANY dynamic index', () => {
    const value = { en: 'x'.repeat(600), ru: 'у'.repeat(600) };
    for (const field of ['description-0', 'description-3', 'description-41'] as const) {
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

describe('aboutFieldSchema — stat rows addressed BY KEY (contract cap 60)', () => {
  it('valid roundtrip: 60 chars per locale passes for known AND custom keys', () => {
    const value = { en: 'x'.repeat(60), ru: 'у'.repeat(60) };
    for (const field of [
      'stat-aboutStatYears',
      'stat-aboutStatRemote',
      'stat-full-stack',
    ] as const) {
      const parsed = aboutFieldSchema(field).safeParse(value);
      expect(parsed.success).toBe(true);
      expect(parsed.success && parsed.data).toEqual(value);
    }
  });

  it('over-cap locale is rejected (en and ru) with aboutStatRequired', () => {
    const enOver = aboutFieldSchema('stat-aboutStatUsers').safeParse({
      en: 'x'.repeat(61),
      ru: 'ок',
    });
    expect(enOver.success).toBe(false);
    if (!enOver.success) {
      expect(enOver.error.issues[0]?.path).toEqual(['en']);
      expect(enOver.error.issues[0]?.message).toBe('aboutStatRequired');
    }
    const ruOver = aboutFieldSchema('stat-aboutStatUsers').safeParse({
      en: 'ok',
      ru: 'у'.repeat(61),
    });
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

describe('field addresses — dynamic indices and record keys (WU-12)', () => {
  it('descriptionIndexOf parses any non-negative index (NaN guard → 0)', () => {
    expect(descriptionIndexOf('description-0')).toBe(0);
    expect(descriptionIndexOf('description-7')).toBe(7);
    expect(descriptionIndexOf('description-99')).toBe(99);
    // Runtime guard: a non-numeric suffix can never reach here through the
    // typed union, but the helper must not trust it anyway (cast to probe).
    expect(descriptionIndexOf('description-nope' as EditAboutField)).toBe(0);
  });

  it('statKeyOf returns the record key verbatim (never a positional index)', () => {
    expect(statKeyOf('stat-aboutStatYears')).toBe('aboutStatYears');
    expect(statKeyOf('stat-full-stack')).toBe('full-stack');
    expect(statKeyOf('stat-')).toBe('');
  });
});

describe('EditAboutField union — every kind resolves a schema', () => {
  const ALL_FIELDS: EditAboutField[] = [
    'fullName',
    'description-0',
    'description-3',
    'stat-aboutStatYears',
    'stat-full-stack',
    'ctaLabel',
  ];

  it('every member parses a valid value (schema dispatch is complete)', () => {
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

  it('stat-<key> looks the record entry up BY KEY (known and custom)', () => {
    const known = defaultValuesFor('stat-aboutStatYears', baseDoc);
    expect(known).toEqual({ stat: { ...baseDoc.stats.aboutStatYears } });
    expect(known.stat).not.toBe(baseDoc.stats.aboutStatYears);

    const custom = defaultValuesFor('stat-full-stack', baseDoc);
    expect(custom).toEqual({ stat: { ...baseDoc.stats['full-stack'] } });
  });

  it('a missing row yields empty defaults (honest unreachable fallback)', () => {
    expect(defaultValuesFor('description-9', baseDoc)).toEqual({});
    expect(defaultValuesFor('stat-gone', baseDoc)).toEqual({});
    expect(defaultValuesFor('ctaLabel', { ...baseDoc, ctaLabel: null })).toEqual({});
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

  it('stat-<key> swaps only that record entry; siblings keep their values', () => {
    const next = { en: '60 projects', ru: '60 проектов' };
    const merged = toMergedDocument(baseDoc, 'stat-aboutStatProjects', next);
    expect(merged.stats.aboutStatProjects).toEqual(next);
    expect(merged.stats.aboutStatYears).toEqual(baseDoc.stats.aboutStatYears);
    expect(merged.stats.aboutStatUsers).toEqual(baseDoc.stats.aboutStatUsers);
    expect(merged.stats.aboutStatRemote).toEqual(baseDoc.stats.aboutStatRemote);
    expect(merged.descriptions).toEqual(baseDoc.descriptions);
    expect(merged.fullName).toBe(baseDoc.fullName);
    expect(merged.ctaLabel).toEqual(baseDoc.ctaLabel);
  });

  it('editing a CUSTOM stat keeps statLabels untouched', () => {
    const next = { en: 'Full Stack Dev', ru: 'Фуллстекер' };
    const merged = toMergedDocument(baseDoc, 'stat-full-stack', next);
    expect(merged.stats['full-stack']).toEqual(next);
    expect(merged.statLabels).toEqual(baseDoc.statLabels);
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
    const merged = toMergedDocument(frozen, 'stat-aboutStatYears', {
      en: '5 years',
      ru: '5 лет',
    });
    expect(merged).not.toBe(frozen);
    expect(frozen).toEqual(baseDoc);
  });
});

describe('withAddedRow — SPEC R-2 add seam (document in → document out)', () => {
  it('appends a description at the END of the array', () => {
    const value = { en: 'Fourth pitch', ru: 'Четвёртый питч' };
    const merged = withAddedRow(baseDoc, { kind: 'description', value });
    expect(merged.descriptions).toHaveLength(4);
    expect(merged.descriptions[3]).toEqual(value);
    expect(merged.descriptions.slice(0, 3)).toEqual(baseDoc.descriptions);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('writes a stat entry AND its custom label under the SAME key', () => {
    const payload: AboutRowPayload = {
      kind: 'stat',
      key: 'react-exp',
      label: { en: 'React experience', ru: 'Опыт React' },
      value: { en: '6 years', ru: '6 лет' },
    };
    const merged = withAddedRow(baseDoc, payload);
    expect(merged.stats['react-exp']).toEqual(payload.value);
    expect(merged.statLabels?.['react-exp']).toEqual(payload.label);
    expect(merged.stats['aboutStatYears']).toEqual(baseDoc.stats['aboutStatYears']);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('a stat added WITHOUT seed statLabels still produces a label record', () => {
    const noLabels: AboutContent = { ...baseDoc, statLabels: undefined };
    const merged = withAddedRow(noLabels, {
      kind: 'stat',
      key: 'k8s',
      label: { en: 'Kubernetes', ru: 'Кубернетес' },
      value: { en: '3 years', ru: '3 года' },
    });
    expect(merged.statLabels).toEqual({ k8s: { en: 'Kubernetes', ru: 'Кубернетес' } });
  });

  it('sets ctaLabel when the row was null (deleted earlier)', () => {
    const merged = withAddedRow(
      { ...baseDoc, ctaLabel: null },
      {
        kind: 'cta',
        value: { en: 'Let’s talk', ru: 'Поговорим' },
      }
    );
    expect(merged.ctaLabel).toEqual({ en: 'Let’s talk', ru: 'Поговорим' });
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('does NOT mutate base (deep-frozen fixture)', () => {
    const frozen = deepFreeze(structuredClone(baseDoc));
    withAddedRow(frozen, { kind: 'description', value: { en: 'x', ru: 'у' } });
    withAddedRow(frozen, { kind: 'cta', value: { en: 'x', ru: 'у' } });
    expect(frozen).toEqual(baseDoc);
  });
});

describe('withRemovedRow — SPEC R-3 delete seam', () => {
  it('removes a description by INDEX; siblings shift, order preserved', () => {
    const merged = withRemovedRow(baseDoc, 'description-1');
    expect(merged.descriptions).toHaveLength(2);
    expect(merged.descriptions[0]).toEqual(baseDoc.descriptions[0]);
    expect(merged.descriptions[1]).toEqual(baseDoc.descriptions[2]);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('removes a stat BY KEY together with its statLabels entry', () => {
    const merged = withRemovedRow(baseDoc, 'stat-full-stack');
    expect(merged.stats['full-stack']).toBeUndefined();
    expect(merged.statLabels?.['full-stack']).toBeUndefined();
    expect(Object.keys(merged.stats)).toHaveLength(4);
    expect(merged.stats.aboutStatYears).toEqual(baseDoc.stats.aboutStatYears);
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('removing a known stat keeps other statLabels (custom entry survives)', () => {
    const merged = withRemovedRow(baseDoc, 'stat-aboutStatYears');
    expect(merged.stats.aboutStatYears).toBeUndefined();
    expect(merged.statLabels?.['full-stack']).toEqual(baseDoc.statLabels?.['full-stack']);
  });

  it('deleting the CTA row sets ctaLabel to null (vitrina hides the link)', () => {
    const merged = withRemovedRow(baseDoc, 'ctaLabel');
    expect(merged.ctaLabel).toBeNull();
    expect(AboutContentSchema.safeParse(merged).success).toBe(true);
  });

  it('the LAST description is removable (the vitrina tolerates emptiness)', () => {
    let doc: AboutContent = { ...baseDoc, descriptions: [{ en: 'Only one', ru: 'Единственный' }] };
    doc = withRemovedRow(doc, 'description-0');
    expect(doc.descriptions).toEqual([]);
    expect(AboutContentSchema.safeParse(doc).success).toBe(true);
  });

  it('does NOT mutate base (deep-frozen fixture)', () => {
    const frozen = deepFreeze(structuredClone(baseDoc));
    withRemovedRow(frozen, 'description-0');
    withRemovedRow(frozen, 'stat-aboutStatYears');
    withRemovedRow(frozen, 'ctaLabel');
    expect(frozen).toEqual(baseDoc);
  });
});

describe('slugFromLabel — D11 stat key generation', () => {
  it('lowercases, separates on non [a-z0-9] and collapses runs', () => {
    expect(slugFromLabel('  Full-Stack Developer! ')).toBe('full-stack-developer');
    expect(slugFromLabel('React & Node.js')).toBe('react-node-js');
  });

  it('caps at 40 chars and never keeps edge dashes', () => {
    expect(slugFromLabel('a'.repeat(50))).toHaveLength(40);
    expect(slugFromLabel('!!! aaa !!!')).toBe('aaa');
  });

  it('a non-latin label yields an EMPTY slug (the resolver rejects it)', () => {
    expect(slugFromLabel('Опыт работы')).toBe('');
  });
});

describe('aboutRowResolverSchema — add-row resolver (SPEC R-2)', () => {
  it('description kind wraps the paragraph slice under `description`', () => {
    const ok = aboutRowResolverSchema('description', []).safeParse({
      description: { en: 'New pitch', ru: 'Новый питч' },
    });
    expect(ok.success).toBe(true);

    const bad = aboutRowResolverSchema('description', []).safeParse({
      description: { en: '', ru: 'ок' },
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(bad.error.issues[0]?.path).toEqual(['description', 'en']);
      expect(bad.error.issues[0]?.message).toBe('aboutParagraphEmpty');
    }
  });

  it('stat kind validates label+value slices (caps 60) under their own keys', () => {
    const ok = aboutRowResolverSchema('stat', []).safeParse({
      statLabel: { en: 'React', ru: 'Реакт' },
      stat: { en: '6 years', ru: '6 лет' },
    });
    expect(ok.success).toBe(true);

    const over = aboutRowResolverSchema('stat', []).safeParse({
      statLabel: { en: 'x'.repeat(61), ru: 'ок' },
      stat: { en: '6 years', ru: '6 лет' },
    });
    expect(over.success).toBe(false);
    if (!over.success) {
      expect(over.error.issues[0]?.path).toEqual(['statLabel', 'en']);
      expect(over.error.issues[0]?.message).toBe('aboutStatRequired');
    }
  });

  it('stat kind rejects a slug that COLLIDES with an existing key', () => {
    const parsed = aboutRowResolverSchema('stat', ['full-stack']).safeParse({
      statLabel: { en: 'Full Stack', ru: 'Фулл-стек' },
      stat: { en: '10 years', ru: '10 лет' },
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['statLabel', 'en']);
      expect(parsed.error.issues[0]?.message).toBe('adminAboutKeyExists');
    }
  });

  it('stat kind rejects a label that generates an EMPTY slug', () => {
    const parsed = aboutRowResolverSchema('stat', []).safeParse({
      statLabel: { en: 'Опыт', ru: 'Опыт' },
      stat: { en: '10 years', ru: '10 лет' },
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['statLabel', 'en']);
      expect(parsed.error.issues[0]?.message).toBe('adminAboutKeyInvalid');
    }
  });

  it('cta kind wraps the CTA slice under `ctaLabel` (cap 40)', () => {
    const ok = aboutRowResolverSchema('cta', []).safeParse({
      ctaLabel: { en: 'Hire me', ru: 'Нанять' },
    });
    expect(ok.success).toBe(true);

    const over = aboutRowResolverSchema('cta', []).safeParse({
      ctaLabel: { en: 'x'.repeat(41), ru: 'ок' },
    });
    expect(over.success).toBe(false);
    if (!over.success) {
      expect(over.error.issues[0]?.path).toEqual(['ctaLabel', 'en']);
      expect(over.error.issues[0]?.message).toBe('aboutCtaRequired');
    }
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
      aboutFieldResolverSchema('stat-full-stack').safeParse({ stat: { en: 'ok', ru: 'ок' } })
        .success
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
