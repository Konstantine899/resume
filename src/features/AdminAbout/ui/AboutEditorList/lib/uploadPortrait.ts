// ============================================
// uploadPortrait — abstract portrait-file operation (admin-about-table WU-14)
// ============================================
//
// SPEC D15/R-7: the form must NOT know WHERE the file lands — it only
// receives `{ name, path }` back from this operation. Everything about the
// storage mechanism (root remembered in IndexedDB, pick-root fallback,
// File-System-Access Chromium risk, the `about` subdirectory) lives HERE,
// behind the shared `imageDir` seam (ProjectForm/AdminSkills/AdminTechnologies
// parity — features → shared is legal, features → features is not).
//
// Outcomes are machine-readable; COPY stays in the component (kit A2
// precedent — this lib owns no i18n).

import { isAbortError, isDirectoryPickerSupported, saveUploadedImage } from '@/shared/lib/imageDir';
import type { FileUploadSelection } from '@/shared/ui/FileUpload';

/** Subdirectory of the picked images root the portrait is written into. */
export const PORTRAIT_SUBDIR = 'about';

/** What the form receives back: the staged file name + its public path. */
export interface UploadedPortrait {
  name: string;
  path: string;
}

export type PortraitUploadOutcome =
  | { ok: true; file: UploadedPortrait }
  /** Browser has no directory picker (non-Chromium) — copy-controlled. */
  | { ok: false; reason: 'unsupported' }
  /** User dismissed the picker — silent return, no error surfaced. */
  | { ok: false; reason: 'aborted' }
  /** Root/subdir write failed — the file is NOT stored, nothing staged. */
  | { ok: false; reason: 'write-failed' };

/** Machine-readable failure reasons (the component maps them to i18n keys). */
export type PortraitUploadFailure = Extract<PortraitUploadOutcome, { ok: false }>['reason'];

/**
 * Remember-or-pick the images root, write `file` into `<root>/about/` and
 * return `{ name, path }` — or the failure reason. NEVER throws: the caller
 * maps reasons to i18n keys (and to silence for `aborted`).
 */
export const uploadPortrait = async (file: FileUploadSelection): Promise<PortraitUploadOutcome> => {
  if (!isDirectoryPickerSupported()) return { ok: false, reason: 'unsupported' };
  try {
    const path = await saveUploadedImage({
      blob: file.blob,
      name: file.name,
      subdir: PORTRAIT_SUBDIR,
    });
    return { ok: true, file: { name: file.name, path } };
  } catch (error) {
    if (isAbortError(error)) return { ok: false, reason: 'aborted' };
    return { ok: false, reason: 'write-failed' };
  }
};
