// versionedStorage factory tests (issue #302): the shared envelope
// mechanics — read fallback, persist validation, remove, upgrade and
// postProcess hooks — pinned on a toy schema so the six delegating
// services only differ in their injected specifics.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createVersionedStorage, dedupeById } from './versionedStorage';

const DocSchema = z.object({ name: z.string().min(1) });
const EnvelopeSchema = z.object({ v: z.literal(1), doc: DocSchema });
type Doc = z.infer<typeof DocSchema>;

const KEY = 'resume.test.doc';

const storage = createVersionedStorage<Doc, z.infer<typeof EnvelopeSchema>>({
  key: KEY,
  envelopeSchema: EnvelopeSchema,
  extract: (envelope) => envelope.doc,
  wrap: (doc) => ({ v: 1, doc }),
});

const VALID: Doc = { name: 'Ada' };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('read', () => {
  it('returns null on an empty store', () => {
    expect(storage.read()).toBeNull();
  });

  it('round-trips a persisted document', () => {
    expect(storage.persist(VALID)).toBe(true);
    expect(storage.read()).toEqual(VALID);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(KEY, '{not json');
    expect(storage.read()).toBeNull();
  });

  it('returns null for an unknown envelope version', () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 2, doc: VALID }));
    expect(storage.read()).toBeNull();
  });

  it('returns null for a schema-invalid document', () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, doc: { name: '' } }));
    expect(storage.read()).toBeNull();
  });

  it('returns null when localStorage.getItem throws (privacy mode)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(storage.read()).toBeNull();
  });

  it('applies the upgrade hook BEFORE validation (legacy documents)', () => {
    const upgraded = createVersionedStorage<Doc, z.infer<typeof EnvelopeSchema>>({
      key: KEY,
      envelopeSchema: EnvelopeSchema,
      extract: (envelope) => envelope.doc,
      wrap: (doc) => ({ v: 1, doc }),
      upgrade: (raw) => {
        if (typeof raw === 'object' && raw !== null && 'doc' in raw) {
          const doc = (raw as { doc: unknown }).doc;
          if (typeof doc === 'object' && doc !== null && !('name' in doc)) {
            return { ...raw, doc: { ...doc, name: 'seeded' } };
          }
        }
        return raw;
      },
    });
    localStorage.setItem(KEY, JSON.stringify({ v: 1, doc: { extra: true } }));
    expect(upgraded.read()).toEqual({ name: 'seeded' });
  });

  it('applies postProcess to the validated payload (dedupe-style fixes)', () => {
    const withFix = createVersionedStorage<Doc, z.infer<typeof EnvelopeSchema>>({
      key: KEY,
      envelopeSchema: EnvelopeSchema,
      extract: (envelope) => envelope.doc,
      wrap: (doc) => ({ v: 1, doc }),
      postProcess: (doc) => ({ ...doc, name: `${doc.name}!` }),
    });
    localStorage.setItem(KEY, JSON.stringify({ v: 1, doc: VALID }));
    expect(withFix.read()).toEqual({ name: 'Ada!' });
  });
});

describe('persist', () => {
  it('reports success for a valid document', () => {
    expect(storage.persist(VALID)).toBe(true);
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify({ v: 1, doc: VALID }));
  });

  it('refuses to write an invalid document and reports failure', () => {
    expect(storage.persist({ name: '' })).toBe(false);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('reports failure instead of throwing on quota/SecurityError', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(storage.persist(VALID)).toBe(false);
  });
});

describe('remove', () => {
  it('clears the key and is idempotent', () => {
    storage.persist(VALID);
    storage.remove();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(() => storage.remove()).not.toThrow();
  });

  it('never throws when removeItem fails', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => storage.remove()).not.toThrow();
  });
});

describe('dedupeById', () => {
  it('keeps first occurrences, warns per duplicate', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const items = [{ id: '1' }, { id: '2' }, { id: '1' }];
    const result = dedupeById(
      items,
      (item) => item.id,
      (id) => `Duplicate id "${id}"`
    );
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Duplicate id "1"');
  });

  it('is a no-op for unique ids (no warnings)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const items = [{ id: 'a' }, { id: 'b' }];
    expect(
      dedupeById(
        items,
        (item) => item.id,
        (id) => id
      )
    ).toEqual(items);
    expect(warn).not.toHaveBeenCalled();
  });
});
