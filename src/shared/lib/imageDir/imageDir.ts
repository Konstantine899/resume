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
import { authToken } from '@/shared/api/authToken';
export const IMAGES_ROOT_KEY = 'imagesRoot';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
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
  if (typeof window === 'undefined') {
    throw new DOMException('Directory picker is not supported', 'NotSupportedError');
  }
  const withPicker = window as WindowWithDirectoryPicker;
  if (!withPicker.showDirectoryPicker) {
    throw new DOMException('Directory picker is not supported', 'NotSupportedError');
  }
  return withPicker.showDirectoryPicker({ mode: 'readwrite', id: 'images-root' });
}

let currentRootPromise: Promise<FileSystemDirectoryHandle> | null = null;

export async function ensureRootWithinGesture(): Promise<FileSystemDirectoryHandle> {
  if (currentRootPromise) return currentRootPromise;
  currentRootPromise = (async () => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(IMAGES_ROOT_KEY)) {
        const remembered = await readImagesRootHandle();
        if (remembered) return remembered;
      }
      const withPicker = window as WindowWithDirectoryPicker;
      if (!withPicker.showDirectoryPicker) {
        throw new DOMException('Directory picker is not supported', 'NotSupportedError');
      }
      const root = await withPicker.showDirectoryPicker({ mode: 'readwrite', id: 'images-root' });
      await writeImagesRootHandle(root);
      if (typeof localStorage !== 'undefined') localStorage.setItem(IMAGES_ROOT_KEY, '1');
      return root;
    } catch (error) {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(IMAGES_ROOT_KEY);
      throw error;
    }
  })();
  try {
    const root = await currentRootPromise;
    return root;
  } finally {
    currentRootPromise = null;
  }
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

/**
 * Typed failure of {@link saveUploadedImage}: the ROOT/subdir write could
 * NOT be completed (permission denied, quota, missing API). Copy stays in
 * the consuming feature — this error carries a machine-readable `reason`
 * and a dev-facing message only. An AbortError (user dismissed the picker)
 * is NEVER wrapped: it is rethrown untouched so callers keep their
 * silent-return branch.
 */
export type ImageUploadErrorReason =
  'permission-denied' | 'root-missing' | 'quota' | 'security' | 'write-failed';

export class ImageUploadError extends Error {
  readonly reason: ImageUploadErrorReason;
  constructor(reason: ImageUploadErrorReason, subdir: string, name: string, cause?: unknown) {
    super(`Failed to save "${name}" into "/images/${subdir}/"`);
    (this as { cause?: unknown }).cause = cause;
    this.name = 'ImageUploadError';
    this.reason = reason;
  }
}

function classifyImageUploadError(error: unknown): ImageUploadErrorReason {
  const name = (error as { name?: string } | null)?.name;
  switch (name) {
    case 'NotAllowedError':
      return 'permission-denied';
    case 'NotFoundError':
      return 'root-missing';
    case 'QuotaExceededError':
      return 'quota';
    case 'SecurityError':
      return 'security';
    default:
      return 'write-failed';
  }
}

/** True for the FSAP picker-dismissal signal (`DOMException` named AbortError). */
export const isAbortError = (error: unknown): boolean =>
  (error as { name?: string } | null)?.name === 'AbortError';

/**
 * The shared icon-upload save flow (review finding #1): remember-or-pick
 * the ROOT images directory, best-effort remember it in IndexedDB, then
 * write `blob` into `subdir` and return the public `/images/<subdir>/<name>`
 * PATH the form should store. One implementation replaces the copy-paste
 * in ProjectForm / AdminSkills TechnologyForm / AdminTechnologies
 * TechnologyForm (features→shared is legal; features→features is not).
 *
 * Note: the explicit `getOrCreateSubdir` step of the old copy-paste is
 * gone — `saveImageToDir` already creates-or-opens the subdir itself
 * (identical FS call sequence, one less line to keep in sync).
 */
export const saveUploadedImage = async (params: {
  blob: Blob;
  name: string;
  subdir: string;
}): Promise<string> => {
  const { blob, name, subdir } = params;
  try {
    const root = await ensureRootWithinGesture();
    return await saveImageToDir(root, blob, name, subdir);
  } catch (error) {
    if (isAbortError(error)) throw error; // caller: silent return
    throw new ImageUploadError(classifyImageUploadError(error), subdir, name, error);
  }
};

/**
 * Parses the public path `saveImageToDir` produced back into its
 * `/images/<subdir>/<name>` parts. Returns `null` for anything else —
 * cleanup must NEVER touch the filesystem on a foreign string (a legacy
 * icon key like `react`, an absolute https URL, a nested path).
 */
function parseImagePath(path: string): { subdir: string; name: string } | null {
  if (!path.startsWith('/images/')) return null;
  const rest = path.slice('/images/'.length);
  const sep = rest.indexOf('/');
  if (sep <= 0 || sep === rest.length - 1) return null;
  const subdir = rest.slice(0, sep);
  const name = rest.slice(sep + 1);
  if (name.includes('/')) return null;
  return { subdir, name };
}

/**
 * Removes `root/<subdir>/<name>` — the cleanup mirror of
 * {@link saveImageToDir}. The subdirectory must ALREADY exist (no
 * `create: true`: a missing directory/entry is a failure the composed
 * flow swallows).
 */
export async function removeImageFromDir(
  root: FileSystemDirectoryHandle,
  subdir: string,
  name: string
): Promise<void> {
  const directory = await root.getDirectoryHandle(subdir);
  await directory.removeEntry(name);
}

/**
 * Best-effort orphan cleanup: deletes the file behind a stored
 * `/images/<subdir>/<name>` path — the tail of the upload-then-persist
 * flow, so a file written just before a FAILED persist does not stay on
 * disk unreferenced (specs: AdminTechnologies §Известные ограничения,
 * AdminSkills §Загрузка иконки rev.6).
 *
 * NEVER throws and NEVER opens the directory picker (an error path has no
 * user gesture for it): an impossible or failed removal resolves `false`
 * and the caller keeps handling its own error.
 */
const BACKEND_IMAGE_NAME =
  /\/images\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|gif|webp|svg))$/i;

async function deleteBackendImage(name: string): Promise<boolean> {
  const doRequest = (token: string | null) =>
    fetch(API_BASE + '/images/' + name, {
      method: 'DELETE',
      headers: token ? { authorization: 'Bearer ' + token } : {},
      credentials: 'include',
    });
  try {
    let res = await doRequest(authToken.getAccessToken());
    if (res.status === 401) {
      const refreshRes = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { accessToken?: string };
        if (data?.accessToken) authToken.setAccessToken(data.accessToken);
        res = await doRequest(authToken.getAccessToken());
      } else {
        return false;
      }
    }
    return res.ok;
  } catch {
    return false;
  }
}

export const removeUploadedImage = async (path: string): Promise<boolean> => {
  const backendName = path.match(BACKEND_IMAGE_NAME)?.[1];
  if (backendName) return deleteBackendImage(backendName);
  const parsed = parseImagePath(path);
  if (!parsed) return false;
  try {
    const root = await readImagesRootHandle();
    if (!root) return false; // nothing remembered → nothing this flow wrote
    await removeImageFromDir(root, parsed.subdir, parsed.name);
    return true;
  } catch {
    return false; // best-effort — must not mask the upstream persist error
  }
};

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
