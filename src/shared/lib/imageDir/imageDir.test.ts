// src/shared/lib/imageDir/imageDir.test.ts
//
// rev.4 + amend 2026-10-10 save-to-directory mechanism. jsdom has neither
// the File System Access API nor IndexedDB — the module is designed to
// DEGRADE (null handle, swallowed remember/cleanup errors), and the tests
// pin exactly that contract plus the write path against fake handles.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  IMAGES_ROOT_KEY,
  ImageUploadError,
  getOrCreateSubdir,
  isAbortError,
  isDirectoryPickerSupported,
  pickImagesRoot,
  readImagesRootHandle,
  removeImageFromDir,
  removeUploadedImage,
  saveImageToDir,
  saveUploadedImage,
  writeImagesRootHandle,
} from './imageDir';

function makeDirectoryHandle(name = 'images'): FileSystemDirectoryHandle {
  return { kind: 'directory', name } as FileSystemDirectoryHandle;
}

beforeEach(() => {
  // jsdom: no indexedDB, no showDirectoryPicker — clean slate each test.
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('imageDir: capability probe', () => {
  it('isDirectoryPickerSupported is false in jsdom (no showDirectoryPicker)', () => {
    expect(isDirectoryPickerSupported()).toBe(false);
  });

  it('isDirectoryPickerSupported is true when window exposes the picker', () => {
    vi.stubGlobal('window', { showDirectoryPicker: () => Promise.resolve(makeDirectoryHandle()) });
    expect(isDirectoryPickerSupported()).toBe(true);
  });

  it('pickImagesRoot throws NotSupportedError when the API is missing', async () => {
    await expect(pickImagesRoot()).rejects.toMatchObject({ name: 'NotSupportedError' });
  });

  it('pickImagesRoot resolves with the root directory the user chose', async () => {
    const handle = makeDirectoryHandle('images');
    vi.stubGlobal('window', { showDirectoryPicker: () => Promise.resolve(handle) });
    await expect(pickImagesRoot()).resolves.toBe(handle);
  });
});

describe('imageDir: remembered root handle (IndexedDB guards)', () => {
  it('readImagesRootHandle returns null when IndexedDB is unavailable (jsdom)', async () => {
    await expect(readImagesRootHandle()).resolves.toBeNull();
  });

  it('writeImagesRootHandle is a no-op when IndexedDB is unavailable', async () => {
    await expect(writeImagesRootHandle(makeDirectoryHandle())).resolves.toBeUndefined();
  });

  it('exposes the pinned IndexedDB key imagesRoot', () => {
    expect(IMAGES_ROOT_KEY).toBe('imagesRoot');
  });
});

describe('imageDir: getOrCreateSubdir', () => {
  it('creates the subdirectory under the root with create: true', async () => {
    const subdir = makeDirectoryHandle('projects');
    const getDirectoryHandle = vi.fn(async () => subdir);
    const root = { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;

    await expect(getOrCreateSubdir(root, 'projects')).resolves.toBe(subdir);
    expect(getDirectoryHandle).toHaveBeenCalledWith('projects', { create: true });
  });
});

describe('imageDir: saveImageToDir', () => {
  it('writes the blob into the subdir under the root and returns /images/<dir>/<name>', async () => {
    const close = vi.fn(async () => undefined);
    const write = vi.fn(async () => undefined);
    const getFileHandle = vi.fn(async () => ({
      createWritable: vi.fn(async () => ({ write, close })),
    }));
    const subdir = { getFileHandle, name: 'projects' } as unknown as FileSystemDirectoryHandle;
    const getDirectoryHandle = vi.fn(async () => subdir);
    const root = { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;
    const blob = new Blob(['bytes'], { type: 'image/webp' });

    const path = await saveImageToDir(root, blob, 'photo.webp', 'projects');

    expect(path).toBe('/images/projects/photo.webp');
    expect(getDirectoryHandle).toHaveBeenCalledWith('projects', { create: true });
    expect(getFileHandle).toHaveBeenCalledWith('photo.webp', { create: true });
    expect(write).toHaveBeenCalledWith(blob);
    expect(close).toHaveBeenCalled();
  });

  it('propagates a write failure (the form maps it to a save-error message)', async () => {
    const getFileHandle = vi.fn(async () => {
      throw new DOMException('denied', 'NotAllowedError');
    });
    const subdir = { getFileHandle } as unknown as FileSystemDirectoryHandle;
    const getDirectoryHandle = vi.fn(async () => subdir);
    const root = { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;

    await expect(
      saveImageToDir(root, new Blob(['x']), 'photo.webp', 'projects')
    ).rejects.toMatchObject({ name: 'NotAllowedError' });
  });
});

// ============================================
// saveUploadedImage — the shared icon-upload flow (review finding #1)
// ============================================
//
// The composed pick/remember/write sequence all three forms used to
// copy-paste. jsdom has no IndexedDB (read → null → picker path) and no
// showDirectoryPicker — the picker is stubbed per test, the write runs
// against fake handles.

/** Fake FSAP root whose directory chain writes through to spies. */
function makeWritableRoot(write: (blob: Blob) => unknown) {
  const close = vi.fn(async () => undefined);
  const getFileHandle = vi.fn(async () => ({
    createWritable: vi.fn(async () => ({
      write: vi.fn(async (blob: Blob) => write(blob)),
      close,
    })),
  }));
  const getDirectoryHandle = vi.fn(async () => ({ getFileHandle }));
  return { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;
}

describe('imageDir: saveUploadedImage', () => {
  it('picks the root, writes the blob and returns /images/<subdir>/<name>', async () => {
    const written: Blob[] = [];
    const root = makeWritableRoot((blob) => written.push(blob));
    vi.stubGlobal('window', { showDirectoryPicker: vi.fn(async () => root) });
    const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });

    await expect(saveUploadedImage({ blob, name: 'logo.svg', subdir: 'skills' })).resolves.toBe(
      '/images/skills/logo.svg'
    );
    expect(written).toEqual([blob]);
  });

  it('rethrows AbortError untouched (the caller keeps its silent-return branch)', async () => {
    const abort = new DOMException('cancelled', 'AbortError');
    vi.stubGlobal('window', { showDirectoryPicker: vi.fn(async () => Promise.reject(abort)) });

    await expect(
      saveUploadedImage({ blob: new Blob(['x']), name: 'x.svg', subdir: 'skills' })
    ).rejects.toBe(abort);
    expect(isAbortError(abort)).toBe(true);
  });

  it('wraps a write failure in ImageUploadError (never mistakable for an abort)', async () => {
    const root = {
      getDirectoryHandle: vi.fn(async () => {
        throw new DOMException('denied', 'NotAllowedError');
      }),
    } as unknown as FileSystemDirectoryHandle;
    vi.stubGlobal('window', { showDirectoryPicker: vi.fn(async () => root) });

    const failure = await saveUploadedImage({
      blob: new Blob(['x']),
      name: 'x.svg',
      subdir: 'technologies',
    }).then(
      () => null,
      (error: unknown) => error
    );

    expect(failure).toBeInstanceOf(ImageUploadError);
    expect(isAbortError(failure)).toBe(false);
  });

  it('isAbortError recognizes only the AbortError name', () => {
    expect(isAbortError(new DOMException('x', 'AbortError'))).toBe(true);
    expect(isAbortError(new Error('x'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});

// ============================================
// removeImageFromDir / removeUploadedImage — orphan cleanup (2026-10-22)
// ============================================
//
// The cleanup side of the upload flow: when the persist AFTER the write
// fails, the form removes the file it just wrote (spec: AdminTechnologies
// §Известные ограничения / AdminSkills §Загрузка иконки rev.6). Contract:
// the composed helper parses ONLY the `/images/<subdir>/<name>` shape
// `saveImageToDir` produced, NEVER opens a picker during cleanup (no user
// gesture there), and NEVER throws — a failed removal must not mask the
// persist error the caller is already handling.

type FakeRequest = {
  result?: unknown;
  onsuccess?: (() => void) | null;
  onerror?: (() => void) | null;
  onupgradeneeded?: (() => void) | null;
};

/** Minimal IndexedDB fake: the `imagesRoot` record resolves to `root`. */
function stubRememberedRoot(root: FileSystemDirectoryHandle): void {
  const db = {
    objectStoreNames: { contains: () => true },
    close: vi.fn(),
    transaction: (_store: string, mode?: string): unknown => {
      if (mode === 'readonly') {
        return {
          objectStore: () => ({
            get: (): FakeRequest => {
              const request: FakeRequest = {};
              queueMicrotask(() => {
                request.result = root;
                request.onsuccess?.();
              });
              return request;
            },
          }),
        };
      }
      // readwrite — the best-effort legacy-key cleanup (must complete or
      // stay pending; either way it is swallowed by the module).
      const tx = {
        error: null,
        objectStore: () => ({ delete: () => undefined, put: () => undefined }),
        oncomplete: undefined as (() => void) | undefined,
      };
      queueMicrotask(() => tx.oncomplete?.());
      return tx;
    },
  };
  vi.stubGlobal('indexedDB', {
    open: (): FakeRequest => {
      const request: FakeRequest = {};
      queueMicrotask(() => {
        request.result = db;
        request.onsuccess?.();
      });
      return request;
    },
  });
}

describe('imageDir: removeImageFromDir', () => {
  it('removes the entry from the EXISTING subdirectory (never create: true)', async () => {
    const removeEntry = vi.fn(async () => undefined);
    const getDirectoryHandle = vi.fn(async () => ({ removeEntry, name: 'skills' }));
    const root = { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;

    await removeImageFromDir(root, 'skills', 'logo.svg');

    expect(getDirectoryHandle).toHaveBeenCalledWith('skills');
    expect(removeEntry).toHaveBeenCalledWith('logo.svg');
  });

  it('propagates a missing directory/entry (the composed flow swallows it)', async () => {
    const getDirectoryHandle = vi.fn(async () => {
      throw new DOMException('gone', 'NotFoundError');
    });
    const root = { getDirectoryHandle } as unknown as FileSystemDirectoryHandle;

    await expect(removeImageFromDir(root, 'skills', 'gone.svg')).rejects.toMatchObject({
      name: 'NotFoundError',
    });
  });
});

describe('imageDir: removeUploadedImage', () => {
  it('parses /images/<subdir>/<name> and removes the file via the remembered root', async () => {
    const removeEntry = vi.fn(async () => undefined);
    const getDirectoryHandle = vi.fn(async () => ({ removeEntry }));
    stubRememberedRoot({ getDirectoryHandle } as unknown as FileSystemDirectoryHandle);

    await expect(removeUploadedImage('/images/skills/logo.svg')).resolves.toBe(true);

    expect(getDirectoryHandle).toHaveBeenCalledWith('skills');
    expect(removeEntry).toHaveBeenCalledWith('logo.svg');
  });

  it('returns false for anything outside the /images/<subdir>/<name> shape', async () => {
    const picker = vi.fn();
    vi.stubGlobal('window', { showDirectoryPicker: picker });

    await expect(removeUploadedImage('react')).resolves.toBe(false);
    await expect(removeUploadedImage('https://cdn.example.com/x.svg')).resolves.toBe(false);
    await expect(removeUploadedImage('/images/')).resolves.toBe(false);
    await expect(removeUploadedImage('/images/skills/')).resolves.toBe(false);
    await expect(removeUploadedImage('/images/a/b/c.svg')).resolves.toBe(false);

    expect(picker).not.toHaveBeenCalled();
  });

  it('returns false when no root is remembered — cleanup NEVER opens a picker', async () => {
    const picker = vi.fn();
    vi.stubGlobal('window', { showDirectoryPicker: picker });

    // jsdom: indexedDB is undefined → readImagesRootHandle() === null.
    await expect(removeUploadedImage('/images/skills/logo.svg')).resolves.toBe(false);

    expect(picker).not.toHaveBeenCalled();
  });

  it('swallows a removal failure (returns false, never throws)', async () => {
    const getDirectoryHandle = vi.fn(async () => ({
      removeEntry: vi.fn(async () => {
        throw new DOMException('busy', 'InvalidModificationError');
      }),
    }));
    stubRememberedRoot({ getDirectoryHandle } as unknown as FileSystemDirectoryHandle);

    await expect(removeUploadedImage('/images/skills/logo.svg')).resolves.toBe(false);
  });
});
