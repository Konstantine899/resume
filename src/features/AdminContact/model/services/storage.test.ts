// Storage tests (plan Contact CRUD §4: envelope read/persist/remove).
// The persist→dispatch ORDER is enforced at the call site (form, WU-3);
// here we pin the storage half: never throw, never write invalid data.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContactContent } from '@/entities/ContactContent';
import { createContactSeed } from './seed';
import {
  CONTACT_CONTENT_STORAGE_KEY,
  persistContactContent,
  readContactContent,
  removeContactContent,
} from './storage';

const VALID: ContactContent = createContactSeed();

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('CONTACT_CONTENT_STORAGE_KEY', () => {
  it('is the plan §4.1 key', () => {
    expect(CONTACT_CONTENT_STORAGE_KEY).toBe('resume.contact.content');
  });
});

describe('readContactContent', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readContactContent()).toBeNull();
  });

  it('round-trips a persisted document', () => {
    expect(persistContactContent(VALID)).toBe(true);
    expect(readContactContent()).toEqual(VALID);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(CONTACT_CONTENT_STORAGE_KEY, '{not json');
    expect(readContactContent()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(CONTACT_CONTENT_STORAGE_KEY, JSON.stringify({ v: 2, content: VALID }));
    expect(readContactContent()).toBeNull();
  });

  it('returns null for a schema-invalid document', () => {
    localStorage.setItem(
      CONTACT_CONTENT_STORAGE_KEY,
      JSON.stringify({ v: 1, content: { ...VALID, email: 'not-an-email' } })
    );
    expect(readContactContent()).toBeNull();
  });

  it('returns null when localStorage itself throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(readContactContent()).toBeNull();
  });
});

describe('persistContactContent', () => {
  it('reports success for a valid document', () => {
    expect(persistContactContent(VALID)).toBe(true);
  });

  it('refuses to write an invalid document and reports failure', () => {
    const ok = persistContactContent({ ...VALID, email: 'nope' });
    expect(ok).toBe(false);
    expect(localStorage.getItem(CONTACT_CONTENT_STORAGE_KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(persistContactContent(VALID)).toBe(false);
  });
});

describe('removeContactContent', () => {
  it('clears the key', () => {
    persistContactContent(VALID);
    removeContactContent();
    expect(localStorage.getItem(CONTACT_CONTENT_STORAGE_KEY)).toBeNull();
  });

  it('is idempotent on an empty store', () => {
    expect(() => removeContactContent()).not.toThrow();
  });

  it('never throws when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => removeContactContent()).not.toThrow();
  });
});
