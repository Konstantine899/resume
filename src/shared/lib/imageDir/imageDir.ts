// src/shared/lib/imageDir/imageDir.ts
//
// Save-to-directory side of the project-images rev.4 flow (owner directive
// 2026-10-10), amend 2026-10-10: the ROOT images directory
// (`src/shared/assets/images/`) is picked ONCE via the File System Access
// API and remembered in IndexedDB under key `imagesRoot` (the old rev.4 key
// `projectsImageDir` held a SUBDIRECTORY handle — best-effort ignored and
// cleaned below); every upload then writes into a SUBDIRECTORY of that root,
// selected or created by the consumer (default `projects`, name passed in).
// The form stores the resulting `/images/<dir>/<name>` PATH — never a
// dataURL. Chrome/Edge only — elsewhere `isDirectoryPickerSupported()` is
// false and the caller shows a copy-controlled message.
//
// This is a shared/lib mechanism (no business logic): many upload blocks may
// reuse it (FSD features→features is banned — amend moved it out of
// AdminMyWork/model/services).

const DB_NAME = 'resume-admin';
const STORE_NAME = 'handles';
/** IndexedDB key for the ROOT images-directory handle. */
export const IMAGES_ROOT_KEY = 'imagesRoot';
/** Pre-amend key holding a subdirectory handle — obsolete, cleaned best-effort. */
const LEGACY_PROJECTS_DIR_KEY = 'projectsImageDir';

/**
 * `showDirectoryPicker` is Chromium-only and not in lib.dom (still WICG) —
 * the DOM handles (`FileSystemDirectoryHandle` & co) ARE typed, so only the
 * entry point needs the narrow window view.
 */
interface WindowWithDirectoryPicker {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: FileSystemHandle | string;
  }) => Promise<FileSystemDirectoryHandle>;
}

export function isDirectoryPickerSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const withPicker = window as WindowWithDirectoryPicker;
  return typeof withPicker.showDirectoryPicker === 'function';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('idb-open-failed'));
  });
}

/**
 * Reads the remembered ROOT images-directory handle.
 *
 * Resolves `null` when nothing is stored OR when IndexedDB is unavailable
 * (jsdom, private-mode quirks) — the caller then falls back to a picker.
 * Best-effort removes the obsolete pre-amend subdirectory key.
 */
export async function readImagesRootHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await openDb();
    try {
      const handle = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(IMAGES_ROOT_KEY);
        request.onsuccess = () => resolve(request.result as FileSystemDirectoryHandle | undefined);
        request.onerror = () => reject(request.error ?? new Error('idb-get-failed'));
      });
      return handle ?? null;
    } finally {
      db.close();
    }
  } catch {
    return null;
  } finally {
    // Best-effort cleanup of the obsolete pre-amend key (root vs subdirectory).
    void clearLegacyProjectsDirKey();
  }
}

/** Best-effort persist — a failed remember must not fail the upload. */
export async function writeImagesRootHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, IMAGES_ROOT_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('idb-put-failed'));
        tx.onabort = () => reject(tx.error ?? new Error('idb-abort-failed'));
      });
    } finally {
      db.close();
    }
  } catch {
    // Intentionally swallowed — the handle still works for this session.
  }
}

/** Opens the system directory picker (user gesture required). */
export async function pickImagesRoot(): Promise<FileSystemDirectoryHandle> {
  const withPicker = window as WindowWithDirectoryPicker;
  if (!withPicker.showDirectoryPicker) {
    throw new DOMException('Directory picker is not supported', 'NotSupportedError');
  }
  return withPicker.showDirectoryPicker({ mode: 'readwrite', id: 'images-root' });
}

/**
 * Returns the existing subdirectory `name` under `root`, or creates it.
 * Permission failures propagate to the caller (mapped to a save-error).
 */
export async function getOrCreateSubdir(
  root: FileSystemDirectoryHandle,
  name: string
): Promise<FileSystemDirectoryHandle> {
  return root.getDirectoryHandle(name, { create: true });
}

/**
 * Writes the blob into `root/<subdir>/<name>` (create-or-overwrite) and
 * returns the public path `/images/<subdir>/<name>` the form should store.
 * The subdir name is taken from the handle (never trusted from the caller).
 */
export async function saveImageToDir(
  root: FileSystemDirectoryHandle,
  blob: Blob,
  name: string,
  subdir: string
): Promise<string> {
  const directory = await getOrCreateSubdir(root, subdir);
  const fileHandle = await directory.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  return `/images/${subdir}/${name}`;
}

/** Best-effort removal of the obsolete pre-amend key. Never throws. */
async function clearLegacyProjectsDirKey(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(LEGACY_PROJECTS_DIR_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error('idb-delete-failed'));
        tx.onabort = () => reject(tx.error ?? new Error('idb-abort-failed'));
      });
    } finally {
      db.close();
    }
  } catch {
    // Intentionally swallowed — the legacy key is harmless if present.
  }
}
