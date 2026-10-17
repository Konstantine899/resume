// Storage tests (technologies-crud SPEC D1/D5: envelope read/persist,
// duplicate-key guard). The persist→dispatch ORDER is enforced at the call
// site (admin feature, WU-3); here we pin the storage half: never throw,
// never write invalid data. (`removeTechnologies` was deleted as dead API —
// review finding #3, PR for issue #266.)

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { seedTechnologies } from '../constants/constants';
import type { Technology } from '../types/types';
import { TECHNOLOGIES_STORAGE_KEY, persistTechnologies, readTechnologies } from './storage';

const VALID: Technology[] = seedTechnologies();

const INVALID_RECORD: Technology = {
  key: '',
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('TECHNOLOGIES_STORAGE_KEY', () => {
  it("is the plan key 'technologies'", () => {
    expect(TECHNOLOGIES_STORAGE_KEY).toBe('technologies');
  });
});

describe('readTechnologies', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readTechnologies()).toBeNull();
  });

  it('round-trips a persisted catalog', () => {
    expect(persistTechnologies(VALID)).toBe(true);
    expect(readTechnologies()).toEqual(VALID);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(TECHNOLOGIES_STORAGE_KEY, '{not json');
    expect(readTechnologies()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(TECHNOLOGIES_STORAGE_KEY, JSON.stringify({ v: 2, technologies: VALID }));
    expect(readTechnologies()).toBeNull();
  });

  it('returns null for a schema-invalid record inside the envelope', () => {
    localStorage.setItem(
      TECHNOLOGIES_STORAGE_KEY,
      JSON.stringify({ v: 1, technologies: [INVALID_RECORD] })
    );
    expect(readTechnologies()).toBeNull();
  });

  it('skips duplicate keys at hydration with a console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const seed = seedTechnologies();
    localStorage.setItem(
      TECHNOLOGIES_STORAGE_KEY,
      JSON.stringify({ v: 1, technologies: [...seed, ...seed] })
    );

    expect(readTechnologies()).toEqual(seed);
    expect(warn).toHaveBeenCalledTimes(seed.length);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('react'));
  });

  it('returns null when localStorage itself throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readTechnologies()).toBeNull();
  });
});

describe('persistTechnologies', () => {
  it('reports success for a valid catalog', () => {
    expect(persistTechnologies(VALID)).toBe(true);
  });

  it('refuses to write an invalid catalog and reports failure', () => {
    expect(persistTechnologies([INVALID_RECORD])).toBe(false);
    expect(localStorage.getItem(TECHNOLOGIES_STORAGE_KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    // Faithful to browsers: setItem throws a DOMException named
    // QuotaExceededError, not a plain Error.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    expect(persistTechnologies(VALID)).toBe(false);
  });
});
