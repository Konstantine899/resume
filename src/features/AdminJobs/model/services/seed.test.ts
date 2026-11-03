// seed tests (plan_workhistory_crud WU-2): the seed must come back as a FRESH
// DEEP copy — RTK auto-freezes state, and returning the live JOBS constant
// would let an immer edit corrupt the vitrina's source (resume-rtk lesson).

import { describe, expect, it } from 'vitest';

import { JOBS, type Job } from '@/entities/Job';
import { createJobsSeed } from './seed';

describe('createJobsSeed', () => {
  const FIRST = JOBS[0] as Job;

  it('equals the entity constant (same content)', () => {
    expect(createJobsSeed()).toEqual(JOBS);
  });

  it('is never the live constant and shares no nested references', () => {
    const seed = createJobsSeed();
    const seedFirst = seed[0] as Job;

    expect(seed).not.toBe(JOBS);
    expect(seedFirst).not.toBe(FIRST);
    expect(seedFirst.description).not.toBe(FIRST.description);
    expect(seedFirst.technologies).not.toBe(FIRST.technologies);
    expect(seedFirst.position).not.toBe(FIRST.position);
  });

  it('keeps Date fields as live Date instances (A11 — no JSON downgrade)', () => {
    const seed = createJobsSeed();
    expect(seed[0]?.startDate).toBeInstanceOf(Date);
    expect(seed[0]?.endDate === null || seed[0]?.endDate instanceof Date).toBe(true);
  });

  it('isolates mutations: editing the copy leaves JOBS intact', () => {
    const seed = createJobsSeed();
    (seed[0] as Job).company = 'MUTATED';
    seed[0]?.description.en.push('injected');
    seed.push({ ...(seed[0] as Job) });

    expect(FIRST.company).toBe('Tech Corp International');
    expect(FIRST.description.en).toHaveLength(4);
    expect(JOBS).toHaveLength(3);
  });
});
