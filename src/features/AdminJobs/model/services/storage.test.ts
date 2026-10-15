// storage tests (plan_workhistory_crud §5: envelope { v: 1, data }, persist-first,
// Date revivify A11, duplicate-id guard, never-throw guarantees).

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JOBS, type Job } from '@/entities/Job';
import { JOBS_STORAGE_KEY, persistJobs, readJobs, removeJobs } from './storage';
import { createJobsSeed } from './seed';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('JOBS_STORAGE_KEY', () => {
  it('is the plan §5 key', () => {
    expect(JOBS_STORAGE_KEY).toBe('resume.jobs');
  });
});

describe('readJobs', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readJobs()).toBeNull();
  });

  it('round-trips a persisted collection with LIVE Date instances (A11)', () => {
    const jobs = createJobsSeed();
    const first = jobs[0] as Job;
    expect(persistJobs(jobs)).toBe(true);

    const read = readJobs();
    expect(read).not.toBeNull();
    expect(read).toHaveLength(jobs.length);
    expect(read?.[0]?.startDate).toBeInstanceOf(Date);
    expect(read?.[0]?.startDate.getTime()).not.toBeNaN();
    expect(read?.[0]?.endDate === null || read?.[0]?.endDate instanceof Date).toBe(true);
    expect(read?.[0]?.startDate).toEqual(first.startDate);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(JOBS_STORAGE_KEY, '{broken');
    expect(readJobs()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify({ v: 2, data: [] }));
    expect(readJobs()).toBeNull();
  });

  it('returns null for a schema-invalid record inside the envelope', () => {
    localStorage.setItem(
      JOBS_STORAGE_KEY,
      JSON.stringify({ v: 1, data: [{ ...JOBS[0], startDate: 'not-a-date' }] })
    );
    expect(readJobs()).toBeNull();
  });

  it('skips duplicate ids at hydration with a console.warn (§7)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const jobs = createJobsSeed();
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify({ v: 1, data: [...jobs, jobs[0]] }));

    const read = readJobs();

    expect(read).toHaveLength(jobs.length);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('Duplicate job id');
  });

  it('returns null when localStorage itself throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readJobs()).toBeNull();
  });
});

describe('persistJobs', () => {
  it('reports success for a valid collection', () => {
    expect(persistJobs(createJobsSeed())).toBe(true);
    expect(localStorage.getItem(JOBS_STORAGE_KEY)).not.toBeNull();
  });

  it('refuses to write an invalid collection and reports failure', () => {
    const invalid = [{ id: '', company: '' }] as unknown as Job[];
    expect(persistJobs(invalid)).toBe(false);
    expect(localStorage.getItem(JOBS_STORAGE_KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(persistJobs(createJobsSeed())).toBe(false);
  });
});

describe('removeJobs', () => {
  it('clears the key', () => {
    persistJobs(createJobsSeed());
    removeJobs();
    expect(localStorage.getItem(JOBS_STORAGE_KEY)).toBeNull();
  });

  it('is idempotent on an empty store', () => {
    expect(() => removeJobs()).not.toThrow();
    expect(() => removeJobs()).not.toThrow();
  });

  it('never throws when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => removeJobs()).not.toThrow();
  });
});
