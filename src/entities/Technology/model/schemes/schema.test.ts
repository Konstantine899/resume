// Schema tests (TDD red → green, technologies-crud SPEC D1).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import { TECHNOLOGIES_SEED } from '../constants/constants';
import type { Technology } from '../types/types';
import { TechnologySchema, TechnologiesEnvelopeSchema } from './schema';

const VALID: Technology = {
  key: 'react',
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  invertInDark: true,
};

describe('TechnologySchema', () => {
  it('accepts a valid record', () => {
    expect(TechnologySchema.safeParse(VALID).success).toBe(true);
  });

  it('output is assignable to Technology (contract compatibility)', () => {
    const parsed = TechnologySchema.parse(VALID);
    const typed: Technology = parsed;
    expect(typed.key).toBe('react');
  });

  it('accepts the live seed TECHNOLOGIES_SEED (seed must always validate)', () => {
    expect(TechnologySchema.array().safeParse(TECHNOLOGIES_SEED).success).toBe(true);
  });

  it('accepts a record without invertInDark (optional flag)', () => {
    const { invertInDark: _i, ...rest } = VALID;
    void _i;
    expect(TechnologySchema.safeParse(rest).success).toBe(true);
  });

  it('rejects an empty key', () => {
    expect(TechnologySchema.safeParse({ ...VALID, key: '' }).success).toBe(false);
  });

  it('rejects a key that is not a lowercase slug', () => {
    const badKeys = ['React', 'my key', 'my_key', '-react', 'react-', 'реact'];
    for (const key of badKeys) {
      expect(TechnologySchema.safeParse({ ...VALID, key }).success).toBe(false);
    }
  });

  it('accepts digit/hyphen slugs (seed keys like d3js must pass)', () => {
    expect(TechnologySchema.safeParse({ ...VALID, key: 'd3js' }).success).toBe(true);
    expect(TechnologySchema.safeParse({ ...VALID, key: 'vue-js-3' }).success).toBe(true);
  });

  it('rejects a non-https or malformed url', () => {
    expect(
      TechnologySchema.safeParse({ ...VALID, url: 'http://cdn.example.com/icon.svg' }).success
    ).toBe(false);
    expect(TechnologySchema.safeParse({ ...VALID, url: 'not-a-url' }).success).toBe(false);
    // Concatenated so the `no-script-url` rule doesn't flag the test literal.
    expect(TechnologySchema.safeParse({ ...VALID, url: `java${'script:'}alert(1)` }).success).toBe(
      false
    );
    expect(
      TechnologySchema.safeParse({ ...VALID, url: 'data:image/png;base64,AAAA' }).success
    ).toBe(false);
  });

  // tech-icon-upload A3: the admin form uploads icons into the shared
  // images directory — the stored url may be an internal /images/... path.
  it('accepts an internal /images/... path (tech-icon-upload A3)', () => {
    expect(
      TechnologySchema.safeParse({ ...VALID, url: '/images/technologies/react-logo.svg' }).success
    ).toBe(true);
    expect(
      TechnologySchema.safeParse({ ...VALID, url: '/images/technologies/sub/logo_2.svg' }).success
    ).toBe(true);
  });

  it('rejects internal paths with spaces or outside /images/', () => {
    expect(
      TechnologySchema.safeParse({ ...VALID, url: '/images/technologies/my logo.svg' }).success
    ).toBe(false);
    expect(TechnologySchema.safeParse({ ...VALID, url: '/uploads/react.svg' }).success).toBe(false);
    expect(TechnologySchema.safeParse({ ...VALID, url: '/images/' }).success).toBe(false);
  });

  it('rejects a non-boolean invertInDark', () => {
    expect(TechnologySchema.safeParse({ ...VALID, invertInDark: 'yes' }).success).toBe(false);
  });
});

describe('TechnologiesEnvelopeSchema', () => {
  it('accepts { v: 2, technologies } with valid records', () => {
    expect(TechnologiesEnvelopeSchema.safeParse({ v: 2, technologies: [VALID] }).success).toBe(
      true
    );
  });

  it('rejects an unknown version (future migration guard)', () => {
    expect(TechnologiesEnvelopeSchema.safeParse({ v: 1, technologies: [VALID] }).success).toBe(
      false
    );
    expect(TechnologiesEnvelopeSchema.safeParse({ v: 3, technologies: [VALID] }).success).toBe(
      false
    );
  });

  it('rejects a missing technologies field', () => {
    expect(TechnologiesEnvelopeSchema.safeParse({ v: 1 }).success).toBe(false);
  });

  it('rejects an invalid record inside the envelope', () => {
    expect(
      TechnologiesEnvelopeSchema.safeParse({
        v: 1,
        technologies: [{ ...VALID, key: '' }],
      }).success
    ).toBe(false);
  });
});
