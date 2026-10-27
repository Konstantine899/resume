// ============================================
// saveAboutField — the merged-save seams (admin-about-table WU-2 + WU-12)
// ============================================
//

import type { AboutContent } from '@/entities/AboutContent';

import {
  toMergedDocument,
  withAddedRow,
  withRemovedRow,
  type AboutFieldValueOf,
  type AboutRowField,
  type AboutRowPayload,
  type EditAboutField,
} from './fieldSchemas';

/** Persist seam injected by the caller (storage in phase 1, backend API in phase 2). */
export type AboutPersist = (doc: AboutContent) => Promise<boolean>;

/**
 * Persist `base` with ONE field replaced. Returns the merged document on
 * success (ready for the dispatch) or `null` on a failed write — the
 * caller toasts `aboutSaveError` and keeps its state open.
 */
export const persistMergedAboutField = async <F extends EditAboutField>(
  base: AboutContent,
  field: F,
  value: AboutFieldValueOf<F>,
  persist: AboutPersist
): Promise<AboutContent | null> => {
  const merged = toMergedDocument(base, field, value);
  return (await persist(merged)) ? merged : null;
};

/** Persist `base` with the added row appended (SPEC R-2). */
export const persistAddedAboutRow = async (
  base: AboutContent,
  payload: AboutRowPayload,
  persist: AboutPersist
): Promise<AboutContent | null> => {
  const merged = withAddedRow(base, payload);
  return (await persist(merged)) ? merged : null;
};

/** Persist `base` with the row removed (SPEC R-3). */
export const persistRemovedAboutRow = async (
  base: AboutContent,
  field: AboutRowField,
  persist: AboutPersist
): Promise<AboutContent | null> => {
  const merged = withRemovedRow(base, field);
  return (await persist(merged)) ? merged : null;
};
