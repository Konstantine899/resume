// Schema tests (TDD red → green, admin-jobs-refactor WU-7 / SPEC R-7).
// Expected values are independent literals — never recomputed the way the
// implementation computes them.

import { describe, expect, it } from 'vitest';

import { JOBS } from '../constants/constants';
import type { Job } from '../types/types';
import { JobSchema, JobsEnvelopeSchema } from './schema';

const VALID: Job = {
  id: 'j-1',
  company: 'Acme Corp',
  position: { en: 'Backend Developer', ru: 'Бэкенд-разработчик' },
  period: '2019 — 2020',
  startDate: new Date('2019-03-01'),
  endDate: new Date('2020-12-31'),
  description: {
    en: ['Shipped the billing service.'],
    ru: ['Выпустил биллинг-сервис.'],
  },
  technologies: ['Node.js'],
  location: 'Remote',
  current: false,
  employmentType: 'full-time',
  level: 'senior',
  featured: false,
};

describe('JobSchema', () => {
  it('accepts a valid record', () => {
    expect(JobSchema.safeParse(VALID).success).toBe(true);
  });

  it('accepts the live seed JOBS (the seed must always validate)', () => {
    expect(JobSchema.array().safeParse(JOBS).success).toBe(true);
  });

  it('rejects an empty bullet array', () => {
    const bad = { ...VALID, description: { en: [], ru: VALID.description.ru } };
    expect(JobSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a 200-char bullet (the cap itself, both locales)', () => {
    const atCap = {
      ...VALID,
      description: { en: ['x'.repeat(200)], ru: ['y'.repeat(200)] },
    };
    expect(JobSchema.safeParse(atCap).success).toBe(true);
  });

  it('rejects a 201-char bullet in description.en (R-7: mirrors jobFormSchema)', () => {
    const bad = {
      ...VALID,
      description: { en: ['x'.repeat(201)], ru: VALID.description.ru },
    };
    expect(JobSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a 201-char bullet in description.ru (R-7: mirrors jobFormSchema)', () => {
    const bad = {
      ...VALID,
      description: { en: VALID.description.en, ru: ['y'.repeat(201)] },
    };
    expect(JobSchema.safeParse(bad).success).toBe(false);
  });
});

describe('JobsEnvelopeSchema', () => {
  it('accepts { v: 1, data } with valid records', () => {
    expect(JobsEnvelopeSchema.safeParse({ v: 1, data: [VALID] }).success).toBe(true);
  });

  it('rejects an unknown version (future migration guard)', () => {
    expect(JobsEnvelopeSchema.safeParse({ v: 2, data: [VALID] }).success).toBe(false);
  });

  it('rejects an invalid record inside the envelope', () => {
    const bad = { ...VALID, company: 'x' };
    expect(JobsEnvelopeSchema.safeParse({ v: 1, data: [bad] }).success).toBe(false);
  });
});
