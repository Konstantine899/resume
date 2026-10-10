// Storage tests (plan_projects_crud §4 + §7: envelope read/persist/remove,
// duplicate-id guard). The persist→dispatch ORDER is enforced at the call
// site (admin form, WU-4); here we pin the storage half: never throw,
// never write invalid data.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Project } from '@/entities/Project';
import { createProjectsSeed } from './seed';
import { PROJECTS_STORAGE_KEY, persistProjects, readProjects, removeProjects } from './storage';

const VALID: Project[] = createProjectsSeed();

const INVALID_RECORD: Project = {
  id: 'broken',
  title: '',
  description: { en: 'Description.', ru: 'Описание.' },
  techIcons: ['react'],
  link: null,
  image: 'https://x.com/img.png',
  category: 'other',
  status: 'completed',
  featured: false,
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('PROJECTS_STORAGE_KEY', () => {
  it('is the plan §4 key', () => {
    expect(PROJECTS_STORAGE_KEY).toBe('resume.projects');
  });
});

describe('readProjects', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readProjects()).toBeNull();
  });

  it('round-trips a persisted collection', () => {
    expect(persistProjects(VALID)).toBe(true);
    expect(readProjects()).toEqual(VALID);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, '{not json');
    expect(readProjects()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify({ v: 2, projects: VALID }));
    expect(readProjects()).toBeNull();
  });

  it('returns null for a schema-invalid record inside the envelope', () => {
    localStorage.setItem(
      PROJECTS_STORAGE_KEY,
      JSON.stringify({ v: 1, projects: [INVALID_RECORD] })
    );
    expect(readProjects()).toBeNull();
  });

  it('skips duplicate ids at hydration with a console.warn (§7)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const seed = createProjectsSeed();
    localStorage.setItem(
      PROJECTS_STORAGE_KEY,
      JSON.stringify({ v: 1, projects: [...seed, ...seed] })
    );

    expect(readProjects()).toEqual(seed);
    expect(warn).toHaveBeenCalledTimes(seed.length);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('1'));
  });

  it('returns null when localStorage itself throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readProjects()).toBeNull();
  });
});

describe('persistProjects', () => {
  it('reports success for a valid collection', () => {
    expect(persistProjects(VALID)).toBe(true);
  });

  it('refuses to write an invalid collection and reports failure', () => {
    expect(persistProjects([INVALID_RECORD])).toBe(false);
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    // Faithful to browsers: setItem throws a DOMException named
    // QuotaExceededError (plan M6 — OPEN-6=A truth), not a plain Error.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    expect(persistProjects(VALID)).toBe(false);
  });
});

describe('removeProjects', () => {
  it('clears the key', () => {
    persistProjects(VALID);
    removeProjects();
    expect(localStorage.getItem(PROJECTS_STORAGE_KEY)).toBeNull();
  });

  it('is idempotent on an empty store', () => {
    expect(() => removeProjects()).not.toThrow();
  });

  it('never throws when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => removeProjects()).not.toThrow();
  });
});
