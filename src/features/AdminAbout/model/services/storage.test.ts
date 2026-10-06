// Storage tests (plan About CRUD §4: envelope read/persist/remove).
// The persist→dispatch ORDER is enforced at the call site (form, WU-3);
// here we pin the storage half: never throw, never write invalid data.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from './seed';
import {
  ABOUT_CONTENT_STORAGE_KEY,
  persistAboutContent,
  readAboutContent,
  removeAboutContent,
} from './storage';

const VALID: AboutContent = createAboutSeed();

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('ABOUT_CONTENT_STORAGE_KEY', () => {
  it('is the plan §4.1 key', () => {
    expect(ABOUT_CONTENT_STORAGE_KEY).toBe('resume.about.content');
  });
});

describe('readAboutContent', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readAboutContent()).toBeNull();
  });

  it('round-trips a persisted document', () => {
    expect(persistAboutContent(VALID)).toBe(true);
    expect(readAboutContent()).toEqual(VALID);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(ABOUT_CONTENT_STORAGE_KEY, '{not json');
    expect(readAboutContent()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(ABOUT_CONTENT_STORAGE_KEY, JSON.stringify({ v: 2, content: VALID }));
    expect(readAboutContent()).toBeNull();
  });

  it('returns null for a schema-invalid document', () => {
    localStorage.setItem(
      ABOUT_CONTENT_STORAGE_KEY,
      JSON.stringify({ v: 1, content: { ...VALID, fullName: '' } })
    );
    expect(readAboutContent()).toBeNull();
  });

  it('returns null when localStorage itself throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readAboutContent()).toBeNull();
  });
});

describe('persistAboutContent', () => {
  it('reports success for a valid document', () => {
    expect(persistAboutContent(VALID)).toBe(true);
  });

  it('refuses to write an invalid document and reports failure', () => {
    const ok = persistAboutContent({ ...VALID, fullName: 'x' });
    expect(ok).toBe(false);
    expect(localStorage.getItem(ABOUT_CONTENT_STORAGE_KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(persistAboutContent(VALID)).toBe(false);
  });
});

describe('removeAboutContent', () => {
  it('clears the key', () => {
    persistAboutContent(VALID);
    removeAboutContent();
    expect(localStorage.getItem(ABOUT_CONTENT_STORAGE_KEY)).toBeNull();
  });

  it('is idempotent on an empty store', () => {
    expect(() => removeAboutContent()).not.toThrow();
  });

  it('never throws when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => removeAboutContent()).not.toThrow();
  });
});
